export const fromBase64 = (str: string): string => {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function(c: string) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
}
