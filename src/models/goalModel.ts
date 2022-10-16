export class GoalModel {
    id: string;
    expectedQuantity: number;
    currentQuantity: number;

    constructor(id: string, expectedQuantity: number, currentQuantity: number) {
        this.id = id;
        this.currentQuantity = currentQuantity;
        this.expectedQuantity = expectedQuantity;
    }

    static empty() {
        return new GoalModel("", 0, 0);
    }

    static clone(goal: GoalModel){
        return new GoalModel(
            goal.id,
            goal.expectedQuantity,
            goal.currentQuantity
        );
    }
}