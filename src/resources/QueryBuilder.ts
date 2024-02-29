import { Model as BaseModel } from "mongoose";
import type { Request } from "express";

export class QueryBuilder<Model extends BaseModel<any>> {
  private filters: Record<string, {name: string, filter: any}> = {};
  private psort: any = {};

  constructor(
    private readonly model: Model,
  ) {}

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

  public sort(query: any) {
    this.psort = query;
    return this;
  }

  public async get(req: Request) {
    const model = this.model;
    const builder = this;

    return new Promise<Model>((resolve) => {
      model
      .find(builder.getFilters(req))
      .sort(builder.psort)
      .exec(function (err: never, data: any) {
        resolve(data);
      });
    });
  }

  public async first(req: Request) {
    const model = this.model;
    const builder = this;

    return new Promise<Model>((resolve) => {
      model.findOne(builder.getFilters(req), function (err: never, data: any) {
        resolve(data);
      });
    });
  }

  public async paginate(req: Request, defaultPerPage?: number) {
    const model = this.model;

    const page = Number(req.query.page ?? 1),
      perPage = Number(req.query.perPage ?? defaultPerPage ?? 10);

    const skip = (page - 1) * perPage;
    
    const builder = this;

    return new Promise<{data: Model, page: number, pages: number, perPage: number}>((resolve) => {
      model
        .find(builder.getFilters(req))
        .skip(skip)
        .limit(perPage)
        .sort(builder.psort)
        .exec(function (err: never, data: any) {
          model.find(builder.getFilters(req)).count().exec(function (err: never, count: number) {
            resolve({
              data,
              page,
              pages: Math.floor(count / perPage) + 1,
              perPage,
            });
          });
        });
    });
  }
}
