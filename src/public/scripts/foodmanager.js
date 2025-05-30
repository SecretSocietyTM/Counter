export class FoodManager {
    constructor() {
      this.foodItems = [];
    }

    addFood(food) {
      this.foodItems.push(food);
    }

    deleteFood(id) {
      const index = this.foodItems.findIndex(item => item.foo_id == id);
      if (index !== -1) {
        this.foodItems.splice(1, index);
      }
    }

    getFoodById(id) {
      return this.foodItems.find(item => item.food_id == id);
    }

    updateFood(id, newData) {
      const index = this.foodItems.findIndex(item => item.foo_id == id);
      if (index !== -1) {
        this.foodItems[index] = newData;
      }
    }

    getAllFoods() {
      return this.foodItems;
    }

    resetFoods() {
      this.foodItems = [];
    }
}