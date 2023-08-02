export const getParamsStr = <T>(params: { [P in keyof T]: T[P] }) => {
    const arr = []
    for (const key in params) {
        if (params[key] !== undefined || params[key] !== null) {
            arr.push(`${key}=${params[key]}`)
        }
    }
    return arr.join('&')
}