import { Activity, Program, SubActivity } from "./model";

export function formatNumber(amount: number, hideZero = false) : string {
    if (amount == 0 && hideZero) return '-'
    if (isNaN(amount)) amount = 0
    return amount.toLocaleString('id-ID');
}

export function programsBudget(programs: Program[], userId?: number) : number {
    let budget = 0
    programs.forEach(p => { budget += programBudget(p, userId) })
    return budget;
}

export function programsCash(programs: Program[], month: number, userId?: number) : number {
    let budget = 0
    programs.forEach(p => { budget += programCash(p, month, userId) })
    return budget;
}

export function programBudget(program: Program, userId?: number) : number {
    let budget = 0
    program.attributes.activities.data.forEach(a => {
        budget += activityBudget(a, userId)
    });
    return budget;
}

export function programCash(program: Program, month: number, userId?: number) : number {
    let budget = 0
    program.attributes.activities.data.forEach(a => {
        budget += activityCash(a, month, userId)
    });
    return budget;
}

export function activityBudget(activity: Activity, userId?: number) : number {
    let budget = 0
    activity.attributes.sub_activities.data.forEach(sa => {
        budget += subActivityBudget(sa, userId)
    })
    return budget;
}

export function activityCash(activity: Activity, month: number, userId?: number) : number {
    let budget = 0
    const subActivities = activity.attributes.sub_activities.data;
    subActivities.forEach(sa => {
        budget += subActivityCash(sa, month, userId)
    })
    return budget;
}

export function subActivityBudget(subActivity: SubActivity, userId?: number) : number {
    const pic = subActivity.attributes.subActivityPic.at(-1)?.user.data.id
    if (userId && pic != userId) return 0
    subActivity.attributes.dpaBudget.sort((sab1, sab2) => sab2.revision - sab1.revision)
    let budget = Number(subActivity.attributes.dpaBudget[0]?.budget ?? 0);
    return budget;
}

export function subActivityCash(subActivity: SubActivity, month: number, userId?: number) : number {
    let budget = 0
    const pic = subActivity.attributes.subActivityPic.at(-1)?.user.data.id
    if (userId && pic != userId) return 0
    subActivity.attributes.cashBudget.forEach((c) => {
        if (c.month?.data.id <= month) {
            const cb = Number(c.budget ?? 0);
            budget += cb
        }
    })
    return budget;
}

