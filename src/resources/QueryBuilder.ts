import {Model as BaseModel, Query} from "mongoose";
import type {Request} from "express";

export class QueryBuilder<Model extends BaseModel<any>> {
    private filters: Record<string, { name: string, filter: any }> = {};
    private psort: string[] = [];
    private pselect: any = {};
    private ppopulate: any = {};
    private hided: string[] = [];

    constructor(
        private readonly model: Model,
    ) {
    }

    private hideFields(data: any) {
        data = JSON.parse(JSON.stringify(data));
        if (this.hided.length === 0)
            return data;
        if (data instanceof Array) {
            return data.map((item) => {
                this.hided.forEach((field) => {
                    delete item[field];
                });
                return item;
            });
        } else {
            this.hided.forEach((field) => {
                delete data[field];
            });
            return data;
        }
    }

    public hide(fields: string[]) {
        this.hided = fields;
        return this;
    }

    public filter(queryName: string, name?: string, param?: (value: string) => any) {
        this.filters[queryName] = {name: name ?? queryName, filter: param ?? ((value: string) => value)};
        return this;
    }

    private getFilters(req: Request) {
        const filters: Record<string, any> = {};
        Object.keys(this.filters).forEach((key) => {
            if (typeof req.query.filter == 'object' && (req.query.filter as any)[key] !== undefined) {
                const filter = this.filters[key];
                filters[filter.name] = filter.filter((req.query.filter as any)[key]);
            }
        });
        return filters;
    }

    public sort(query: string | string[]) {
        if (query instanceof Array)
            this.psort.push(...query);
        else
            this.psort.push(query);
        return this;
    }

    private getSort(req: Request) {
        if (typeof req.query?.sort != 'string')
            return "";
        let sorts = "";
        const sortsRequest = req.query.sort.split(",");
        this.psort.forEach((sort) => {
            const sortValue = sortsRequest.find((value) => value === sort || value === `-${sort}` || value === `+${sort}`);
            if (sortValue !== undefined)
                sorts += `${sortValue} `;
        });
        return sorts;
    }

    public select(query: any) {
        this.pselect = query;
        return this;
    }

    private populateQuery(query: Query<any, any>) {
        Object.keys(this.ppopulate).forEach((key) => {
            query.populate(key, this.ppopulate[key]);
        });
        return query;
    }

    public populate(path: string, select?: any) {
        this.ppopulate[path] = select;
        return this;
    }

    public async get(req: Request) {
        const model = this.model;
        const builder = this;

        return new Promise<Model>((resolve) => {
            model
                .find(builder.getFilters(req))
                .select(builder.pselect)
                .sort(builder.getSort(req))
                .exec(function (err: never, data: any) {
                    resolve(builder.hideFields(data));
                });
        });
    }

    public async first(req: Request) {
        const model = this.model;
        const builder = this;

        return new Promise<Model>((resolve) => {
            model.findOne(builder.getFilters(req))
                .select(builder.pselect)
                .exec(function (err: never, data: any) {
                    resolve(builder.hideFields(data));
                });
        });
    }

    public async paginate(req: Request, defaultPerPage?: number) {
        const model = this.model;

        const page = Number(req.query.page ?? 1),
            perPage = Number(req.query.perPage ?? defaultPerPage ?? 10);

        const skip = (page - 1) * perPage;

        const builder = this;

        return new Promise<{ data: Model, page: number, pages: number, perPage: number, total: number }>((resolve) => {
            const request = model
                .find(builder.getFilters(req))
                .skip(skip)
                .limit(perPage)
                .sort(builder.getSort(req))
                .select(builder.pselect);

            builder.populateQuery(request);


            request.exec(function (err: never, data: any) {
                model.find(builder.getFilters(req)).count().exec(function (err: never, count: number) {
                    resolve({
                        data: builder.hideFields(data),
                        page,
                        pages: Math.floor(count / perPage) + 1,
                        perPage,
                        total: count,
                    });
                });
            });
        });
    }
}
