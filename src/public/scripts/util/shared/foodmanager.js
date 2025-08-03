export class FoodManager {
    constructor() {
        this.foods = [];
    }

    add(food) {
        this.foods.push(food);
    }

    delete(id, id_type) {
        const index = this.foods.findIndex(item => item[id_type] == id);
        if (index !== -1) {
            this.foods.splice(index, 1);
        }
    }

    getFoodById(id, id_type) {
        return this.foods.find(item => item[id_type] == id);
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

    size() {
        return this.foods.length;
    }
}