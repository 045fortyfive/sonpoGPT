// 保険料相場データ（2026年）
export interface InsurancePricing {
    withVehicle: number;
    withoutVehicle: number;
}

export interface AgeGroupPricing {
    [grade: string]: InsurancePricing;
}

export const insurancePricing: Record<string, AgeGroupPricing> = {
    "20s": {
        grade6: { withVehicle: 24230, withoutVehicle: 12260 },
        grade9: { withVehicle: 6510, withoutVehicle: 3340 },
    },
    "30s": {
        grade6: { withVehicle: 7930, withoutVehicle: 3810 },
        grade15: { withVehicle: 4450, withoutVehicle: 2040 },
    },
    "40s": {
        grade15: { withVehicle: 4200, withoutVehicle: 1900 },
        grade20: { withVehicle: 3800, withoutVehicle: 1800 },
    },
    "50s": {
        grade20: { withVehicle: 3500, withoutVehicle: 1700 },
    },
};

export interface Insurer {
    name: string;
    discount: number | null;
    features: string[];
}

export const topInsurers: Insurer[] = [
    {
        name: "SBI損保",
        discount: 14500,
        features: ["業界最高水準のロードサービス", "新規ネット申込で割引"],
    },
    {
        name: "アクサダイレクト",
        discount: 20000,
        features: ["合理的な保険料設計", "全員もらえるキャンペーン"],
    },
    {
        name: "三井ダイレクト",
        discount: null,
        features: ["MS&ADグループの安心感", "充実の事故ネットワーク"],
    },
];

// 年代と等級から推奨保険料を取得
export function getRecommendedPrice(
    age: number,
    grade: number,
    hasVehicleInsurance: boolean = true
): number {
    let ageGroup: string;
    let gradeKey: string;

    // 年代判定
    if (age < 30) {
        ageGroup = "20s";
        gradeKey = grade >= 9 ? "grade9" : "grade6";
    } else if (age < 40) {
        ageGroup = "30s";
        gradeKey = grade >= 15 ? "grade15" : "grade6";
    } else if (age < 50) {
        ageGroup = "40s";
        gradeKey = grade >= 20 ? "grade20" : "grade15";
    } else {
        ageGroup = "50s";
        gradeKey = "grade20";
    }

    const pricing = insurancePricing[ageGroup]?.[gradeKey];
    if (!pricing) {
        // デフォルト値
        return hasVehicleInsurance ? 5000 : 2500;
    }

    return hasVehicleInsurance ? pricing.withVehicle : pricing.withoutVehicle;
}

// 削減可能額を計算
export function calculateSavings(
    currentMonthlyPrice: number,
    age: number,
    grade: number,
    hasVehicleInsurance: boolean = true
) {
    const recommendedPrice = getRecommendedPrice(age, grade, hasVehicleInsurance);
    const monthlySavings = Math.max(0, currentMonthlyPrice - recommendedPrice);
    const yearlySavings = monthlySavings * 12;

    return {
        currentMonthlyPrice,
        recommendedPrice,
        monthlySavings,
        yearlySavings,
        savingsPercentage: currentMonthlyPrice > 0
            ? Math.round((monthlySavings / currentMonthlyPrice) * 100)
            : 0,
    };
}
