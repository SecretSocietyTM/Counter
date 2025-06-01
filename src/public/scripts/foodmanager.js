export class FoodManager {
    constructor() {
        this.foods = [];
    }

    addFood(food) {
        this.foods.push(food);
    }

    deleteFood(id) {
        const index = this.foods.findIndex(item => item.id == id);
        if (index !== -1) {
            this.foods.splice(1, index);
        }
    }

    getFoodById(id) {
        return this.foods.find(item => item.id == id);
    }

    updateFood(id, data) {
        const index = this.foods.findIndex(item => item.id == id);
        if (index !== -1) {
            this.food[index] = data;
        } 
    }

    getAllFoods() {
        return this.foods;
    }
}