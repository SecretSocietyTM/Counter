export class FoodManager {
    constructor() {
        this.foods = [];
    }

    add(food) {
        this.foods.push(food);
    }

    delete(id) {
        const index = this.foods.findIndex(item => item.food_id == id);
        if (index !== -1) {
            this.foods.splice(1, index);
        }
    }

    getFoodById(id) {
        return this.foods.find(item => item.food_id == id);
    }

    updateFood(id, data) {
        const index = this.foods.findIndex(item => item.food_id == id);
        if (index !== -1) {
            this.foods[index] = data;
        } 
    }

    getAllFoods() {
        return this.foods;
    }

    deleteAll() {
        this.foods.length = 0;
    }
}