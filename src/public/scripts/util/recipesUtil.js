// updaters
export function updateReport(obj, food, serves=1, flag="add") {
    const sign = flag === "sub" ? -1 : 1;
    for (const key of ["cal", "fat", "carb", "prot"]) {
        obj.total[key] += sign * food[key];
        obj.perserv[key] = obj.total[key] / serves;
    }
    roundMacros(obj.total);
    roundMacros(obj.perserv);
}

export function updateReportPerServ(obj, serves) {
    for (const key of ["cal", "fat", "carb", "prot"]) {
        obj.perserv[key] = obj.total[key] / serves;
    }
    obj.perserv.cal = Math.round(obj.perserv.cal * 10) / 10;
    roundMacros(obj.perserv);
}



// resetters
export function resetReport(obj) {
    for (const key of ["cal", "fat", "carb", "prot"]) {
        obj.total[key] = 0;
        obj.perserv[key] = 0;
    }
}



// misc
export function roundMacros(obj) {
    for (let key of ["fat", "carb", "prot"]) {
        obj[key] = Math.round(obj[key] * 10) / 10;
    }    
}