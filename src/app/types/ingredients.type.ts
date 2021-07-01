export interface HttpSuccessRequest<T> {
    success: boolean;
    payload: T;
    message: string;
}
  
export interface Ingredient {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    image: string;

    fat?: number;
    calories?: number;
    carbohydrates?: number;
}

export interface SpoonocularResult {
    results: SpoonocularIngredient[];
    offset: number;
    number: number;
    totalResults: number;
}

export interface SpoonocularIngredient {
    id: number;
    name: string;
    image: string;
}
  
export interface SpoonocularIngredientInformation {
    id: number;
    original: string;
    originalName: string;
    name: string;
    nameClean: string;
    amount: number;
    unit: string;
    unitShort: string;
    unitLong: string;
    possibleUnits?: (string)[] | null;
    estimatedCost: EstimatedCost;
    consistency: string;
    shoppingListUnits?: (string)[] | null;
    aisle: string;
    image: string;
    meta?: (null)[] | null;
    nutrition: Nutrition;
    categoryPath?: (string)[] | null;
}

export interface EstimatedCost {
    value: number;
    unit: string;
}

export interface Nutrition {
    nutrients?: (NutrientsEntity)[] | null;
    properties?: (PropertiesEntity)[] | null;
    caloricBreakdown: CaloricBreakdown;
    weightPerServing: WeightPerServing;
}

export interface NutrientsEntity {
    name: string;
    amount: number;
    unit: string;
    percentOfDailyNeeds: number;
}

export interface PropertiesEntity {
    name: string;
    amount: number;
    unit: string;
}

export interface CaloricBreakdown {
    percentProtein: number;
    percentFat: number;
    percentCarbs: number;
}

export interface WeightPerServing {
    amount: number;
    unit: string;
}
  