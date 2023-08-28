import { Activity, Month, Program, SubActivity } from "../utils/model";
import { activityBudgetRealization, formatPercentage, formatPercentageFromString, formatWithMeasurement, programBudgetRealization, programsBudgetRealization, subActivityBudgetRealization } from "../utils/realization-helpers";
import { formatNumber, activityBudget, activityCash, programBudget, programCash, subActivityBudget, subActivityCash, programsBudget, programsCash } from "../utils/budget-helpers";

interface RakTableParams {
    month?: Month;
    data: Program[];
    userId?: number;
}

interface RakHeaderParams {
    month?: Month;
}

interface RakFooterParams {
    month?: number;
    programs: Program[];
    userId?: number;
}

interface ProgramSectionParams {
    month?: number;
    program: Program;
    userId?: number;
}

interface ActivitySectionParams {
    month?: number;
    number?: number;
    activity: Activity;
    userId?: number;
}

interface SubActivitySectionParams {
    month?: number;
    subActivity: SubActivity;
    userId?: number;
}


function SubActivitySection({
    month,
    subActivity,
    userId,
} : SubActivitySectionParams) {
    const target = subActivity.attributes.subActivityTarget;
    const measurement = target.measurement.data;
    const budget = subActivityBudget(subActivity, userId);
    const cash = subActivityCash(subActivity, month ?? 0, userId);
    const budgetRealization = subActivityBudgetRealization(subActivity, month ?? 0, userId);
    const budgetRealizationPercentage = budgetRealization / budget * 100
    const cashRealizationPercentage = budgetRealization / cash * 100
    const realization = subActivity.attributes.realization.find(r => r.month.data.id == month);
    const budgetProblem = realization?.budgetProblem.problem ?? '';
    const budgetSolution = realization?.budgetProblem.solution ?? '';
    const physical = realization?.physical;
    const physicalAchievement = realization?.physicalAchievement;
    const physicalProblem = realization?.budgetProblem.problem ?? '';
    const physicalSolution = realization?.budgetProblem.solution ?? '';
    const pic = subActivity.attributes.subActivityPic.at(-1)

    if (userId && (pic?.user.data.id != userId)) return <tr></tr>

    return (
        <tr>
            <td></td>
            <td></td>
            <td></td>
            <td>{subActivity.attributes.name}</td>
            <td>{subActivity.attributes.indicator}</td>
            <td>{formatWithMeasurement(target.target, measurement)}</td>
            <td>{formatNumber(budget)}</td>
            {
                month && (
                    <>
                        <td>{formatNumber(cash)}</td>
                        <td>{formatNumber(budgetRealization)}</td>
                        <td>{formatPercentage(budgetRealizationPercentage)}</td>
                        <td>{formatPercentage(cashRealizationPercentage)}</td>
                        <td>{budgetProblem}</td>
                        <td>{budgetSolution}</td>
                        <td>{formatWithMeasurement(physical, measurement)}</td>
                        <td>{formatPercentageFromString(physicalAchievement ?? '0')}</td>
                        <td>{physicalProblem}</td>
                        <td>{physicalSolution}</td>
                    </>
                )
            }
        </tr>
    );
}

function ActivitySection({
    month,
    number,
    activity,
    userId,
} : ActivitySectionParams) {
    const objectiveIndicator = activity.attributes.objectiveIndicator.data;
    const objective = objectiveIndicator.attributes.objective.data;
    var subActivities = activity.attributes.sub_activities.data;
    const target = activity.attributes.activityTarget;
    const budget = activityBudget(activity, userId);
    const cash = activityCash(activity, month ?? 0, userId);
    const budgetRealization = activityBudgetRealization(activity, month ?? 0, userId);
    const budgetRealizationPercentage = budgetRealization / budget * 100
    const cashRealizationPercentage = budgetRealization / cash * 100

    if (userId) {
        subActivities = subActivities.filter(sa => sa.attributes.subActivityPic.at(-1)?.user.data.id == userId)
        if (subActivities.length == 0) return <tr></tr>
    }

    return (
        <>
            <tr className="font-semibold">
                <td>{objective.attributes.name}</td>
                <td>{objectiveIndicator.attributes.name}</td>
                <td>{objectiveIndicator.attributes.objectiveTarget.target}</td>
                <td>{activity.attributes.name}</td>
                <td>{activity.attributes.indicator}</td>
                <td>{formatWithMeasurement(target.target, target.measurement.data)}</td>
                <td>{formatNumber(budget)}</td>
                {
                    month && (
                        <>
                            <td>{formatNumber(cash)}</td>
                            <td>{formatNumber(budgetRealization)}</td>
                            <td>{formatPercentage(budgetRealizationPercentage)}</td>
                            <td>{formatPercentage(cashRealizationPercentage)}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </>
                    )
                }
            </tr>
            {subActivities.map((subActivity) => {
                const key = "sa-" + subActivity.id
                return (
                    <SubActivitySection
                        key={key}
                        month={month}
                        subActivity={subActivity}
                        userId={userId}
                    ></SubActivitySection>
                )
            })}
        </>
    );
}

function ProgramSection({
    month,
    program,
    userId,
} : ProgramSectionParams) {
    const activities = program.attributes.activities.data;
    const target = program.attributes.programTarget;
    const budget = programBudget(program, userId);
    const cash = programCash(program, month ?? 0, userId);
    const budgetRealization = programBudgetRealization(program, month ?? 0, userId);
    const budgetRealizationPercentage = budgetRealization / budget * 100
    const cashRealizationPercentage = budgetRealization / cash * 100

    let number = 0;
    let indicatorId = 0;
    return (
        <>
            <tr className="font-bold bg-green-600">
                <td></td>
                <td></td>
                <td></td>
                <td>{program.attributes.name}</td>
                <td>{program.attributes.indicator}</td>
                <td>{formatWithMeasurement(target.target, target.measurement.data)}</td>
                <td>{formatNumber(budget)}</td>
                {
                    month && (
                        <>
                            <td>{formatNumber(cash)}</td>
                            <td>{formatNumber(budgetRealization)}</td>
                            <td>{formatPercentage(budgetRealizationPercentage)}</td>
                            <td>{formatPercentage(cashRealizationPercentage)}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </>
                    )
                }
            </tr>
            {activities.map((activity) => {
                const key = "activity-" + activity.id
                const id = activity.attributes.objectiveIndicator.data.id
                let n: number | undefined
                if (indicatorId != id) {
                    indicatorId = id
                    number++
                    n = number
                }
                return (
                    <ActivitySection
                        key={key}
                        month={month}
                        activity={activity}
                        number={n}
                        userId={userId}
                    ></ActivitySection>
                )
            })}
        </>
    );
}

function RakHeader({
    month,
} : RakHeaderParams) {
    let until = ''
    if (month && month?.id != 1) {
        until = `- ${month?.attributes.shortName}`
    }
    return (
        <thead>    
            <tr>
                <th rowSpan={2}>Sasaran Strategis</th>
                <th rowSpan={2}>Indikator Kinerja Sasaran</th>
                <th rowSpan={2}>Target Kinerja Sasaran</th>
                <th rowSpan={2}>Program / Kegiatan / Sub Kegiatan</th>
                <th colSpan={2}>Sasaran Program / Kegiatan / Sub Kegiatan DPA</th>
                <th rowSpan={2}>Anggaran DPA (Rp.)</th>
                {
                    month && (
                        <>
                            <th rowSpan={2}>Total Anggaran Kas Jan {until} (Rp.)</th>
                            <th rowSpan={2}>Total Realisasi Jan {until} (Rp.)</th>
                            <th rowSpan={2}>Presentasi Realisasi Keuangan</th>
                            <th rowSpan={2}>Presentasi Realisasi thd Angkas</th>
                            <th colSpan={2}>Realisasi Keuangan</th>
                            <th rowSpan={2}>Realisasi Kinerja Fisik</th>
                            <th rowSpan={2}>Tingkat Capaian Realisasi (%)</th>
                            <th colSpan={2}>Realisasi Kinerja Fisik</th>
                        </>
                    )
                }
            </tr>
            <tr>
                <th>Indikator Kinerja</th>
                <th>Target</th>
                {
                    month && (
                        <>
                            <th>Rincian Masalah</th>
                            <th>Solusi/ Tindak Lanjut</th>
                            <th>Rincian Masalah</th>
                            <th>Solusi/ Tindak Lanjut</th>
                        </>
                    )
                }
            </tr>
        </thead>
    );
}
function RakFooter({
    month,
    programs,
    userId,
} : RakFooterParams) {
    const budget = programsBudget(programs, userId);
    const cash = programsCash(programs, month ?? 0, userId);
    const budgetRealization = programsBudgetRealization(programs, month ?? 0, userId);
    const budgetRealizationPercentage = budgetRealization / budget * 100
    const cashRealizationPercentage = budgetRealization / cash * 100
    return (
        <tfoot>    
            <tr>
                <th colSpan={6}>Total</th>
                <th>{formatNumber(budget)}</th>
                {
                    month && (
                        <>
                            <th>{formatNumber(cash)}</th>
                            <th>{formatNumber(budgetRealization)}</th>
                            <th>{formatPercentage(budgetRealizationPercentage)}</th>
                            <th>{formatPercentage(cashRealizationPercentage)}</th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                        </>
                    )
                }
            </tr>
        </tfoot>
    );
}

export default function RakTable({
    month,
    data: programs,
    userId,
} : RakTableParams) {
    return (
        <table className="table-auto mx-auto" id="rak">
            <RakHeader month={month} />
            <tbody>
                {programs.map((program) => {
                    const key = "program-" + program.id
                    return (
                        <ProgramSection
                            key={key}
                            month={month?.id}
                            program={program}
                            userId={userId}
                        />
                    );
                })}
            </tbody>
            <RakFooter month={month?.id} programs={programs} userId={userId}/>
        </table>
    );
}
