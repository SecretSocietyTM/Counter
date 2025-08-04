import Dashboard from "./dashboard.js";
import HeaderDate from "./headerdate.js";
import CalorieStats from "./caloriestats.js";
import CalorieGoal from "./caloriegoal.js";
import Macros from "./macros.js";
import MealList from "./meallist.js";
import MealStats from "./mealstats.js";
import Averages from "./averages.js";
import BarGraphs from "./bargraphs.js";

export default {
    dashboard: new Dashboard(),

    headerdate: new HeaderDate(),

    calorie_stats: new CalorieStats(),
    calorie_goal: new CalorieGoal(),
    macros: new Macros(),

    breakfast_list: new MealList("Breakfast"),
    lunch_list: new MealList("Lunch"),
    dinner_list: new MealList("Dinner"),
    snacks_list: new MealList("Snacks"),

    breakfast_stats: new MealStats("Breakfast"),
    lunch_stats: new MealStats("Lunch"),
    dinner_stats: new MealStats("Dinner"),
    snacks_stats: new MealStats("Snacks"),

    averages: new Averages(),
    bargraphs: new BarGraphs()
};