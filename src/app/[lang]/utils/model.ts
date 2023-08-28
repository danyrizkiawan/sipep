type StrapiResponse<T> = {
  data: T;
  message: string;
};

export interface Attribute {
	url: string;
	alternativeText?: any;
	caption?: any;
	width: number;
	height: number;
}

export interface Data {
	id: number;
	attributes: Attribute;
}

export interface Picture {
	data: Data;
}

export interface Button {
	id: number;
	url: string;
	newTab: boolean;
	text: string;
	type: string;
}

export interface ContentSection {
	id: number;
	__component: string;
	title: string;
	description: string;
	picture: Picture;
	buttons: Button[];
}

export interface Attribute {
	shortName: string;
	slug: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	locale: string;
	heading?: any;
	description?: any;
	contentSections: ContentSection[];
}

export interface Data {
	id: number;
	attributes: Attribute;
}

export interface Pagination {
	page: number;
	pageSize: number;
	pageCount: number;
	total: number;
}

export interface Meta {
	pagination: Pagination;
}

export interface RootObject {
	data: Data[];
	meta: Meta;
}

export interface User {
	id: number;
	username: string;
	fullName: string;
	nip: string;
	echelon: string;
	position: string;
	evaluationScope: string;
	unit: Unit;
}

export interface UserWithAttributes {
	id: number;
	attributes: {
		username: string;
		fullName: string;
		nip: string;
		echelon: string;
		position: string;
		evaluationScope: string;
		unit: Unit;
	}
}

export interface Unit {
	id: number;
	name: string;
	headOfUnit: UserHistory[]
}

export interface UserHistory {
	year: number;
	month: number;
	user: User;
}

export interface Month {
	id: number;
	attributes: {
		name: string;
		shortName: string;
	}
}

export interface Document {
    id: number;
    attributes: {
        year: number;
        name: string;
        description?: string;
        createdAt: string;
        updatedAt: string;
        publishedAt: string;
        document: {
            data: {
                attributes: {
                    url: string;
                };
            };
        };
    };
}

export interface Measurement {
	id: number;
	attributes: {
        name: string;
        type: string;
        visibility: boolean;
        createdAt: string;
        updatedAt: string;
    };
}

export interface Measurement {
	id: number;
	attributes: {
        name: string;
        type: string;
        visibility: boolean;
        createdAt: string;
        updatedAt: string;
    };
}

export interface Objective {
	id: number;
	attributes: {
        year: string;
        name: string;
        createdAt: string;
        updatedAt: string;
    };
}

export interface ObjectiveIndicator {
	id: number;
	attributes: {
        objective: {
			data: Objective;
		};
        name: string;
        createdAt: string;
        updatedAt: string;
		objectiveTarget: Target;
    };
}

export interface Program {
	id: number;
	attributes: {
        name: string;
		indicator: string;
		programTarget: Target;
        activities: {
            data: Activity[];
        };
    };
}

export interface Activity {
	id: number;
	attributes: {
        name: string;
        indicator: string;
		activityTarget: Target;
		program: {
			data: Program;
		}
		objectiveIndicator: {
			data: ObjectiveIndicator;
		};
		sub_activities: {
			data: SubActivity[];
		};
    };
}

export interface SubActivity {
	id: number;
	attributes: {
        name: string;
		indicator: string;
		subActivityTarget: Target;
		dpaBudget: Budget[];
		cashBudget: Budget[];
		realization: Realization[];
		subActivityPic: Pic[];
    };
}

export interface Target {
	id: number;
	target: string;
	measurement: {
		data: Measurement
	}
}

export interface Budget {
	id: number;
	month: {
		data: Month;
	}
	revision: number;
	budget: number;
}

export interface Problem {
	id: number;
	problem: string;
	solution: string;
}

export interface Realization {
	id: number;
	month: {
		data: Month;
	}
	budget: number;
	budgetProblem: Problem;
	physical: string;
	physicalTarget: string;
	physicalAchievement: string;
	physicalProblem: Problem;
}

export interface Pic {
	id: number;
	month: {
		data: Month;
	}
	user: {
		data: UserWithAttributes;
	}
}
