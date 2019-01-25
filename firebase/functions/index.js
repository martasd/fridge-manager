"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var _a;
var _this = this;
var actions_on_google_1 = require("actions-on-google");
var unirest = require('unirest');
var functions = require('firebase-functions');
var dialogflow = require('actions-on-google').dialogflow;
var app = dialogflow();
// function Recipe(name: string, ingredients: string[]) {
//   this.name = name;
//   this.ingredients = ingredients;
// }
function presentRecipe(conv, number) {
    var chosenRecipe = conv.contexts.get('recipe-options').parameters[number];
    conv.user.storage.currentRecipe = chosenRecipe;
    conv.ask('Wonderful. Excellent choice! Would you like assistance with cooking ' +
        chosenRecipe.title +
        '?');
}
function redirectToCookingApp(conv) {
    var chosenRecipe = conv.user.storage.currentRecipe;
    conv.close('To enlist a cooking assistant to guide you while you cook, say: find me ' +
        chosenRecipe.title +
        ' to Google assistant after leaving this application. Bon appetit!');
}
function finish(conv) {
    conv.close('You must be a pro then. Good luck and bon appetit!');
}
function noRecipe(conv, single) {
    conv.close('Unfortunately, we have not found any ' +
        single +
        ' matching recipe for your ingredients. You might consider paying a visit to a grocery store.');
}
// How many recipes to select?
var maxSelectedNum = 3;
app.intent('WelcomeAndLearnIngredients', function (conv) {
    conv.ask('Welcome to Fridge Manager. Which ingredients do you have available? For example, you can say onion, potatoes, and salt.');
});
// Retrieve matched recipes from Spoonacular
function fetchRecipes(ingredients, selectedRecipes) {
    // Contruct the API request string
    var getString = 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/findByIngredients?number=3&ranking=1&ingredients=';
    ingredients.forEach(function (ingredient, index) {
        getString += ingredient;
        if (index != ingredients.length - 1) {
            getString += '%2C';
        }
    });
    console.log(getString);
    // External API call returns a Promise
    return new Promise(function (resolve, reject) {
        unirest
            .get(getString)
            .header('X-RapidAPI-Key', 'bcd6824181msh975176809d91b13p14cf9djsn709a7caa5d1c')
            .end(function (response) {
            if (response) {
                console.log(response.status, response.headers, response.body);
                response.body.forEach(function (recipe) {
                    console.log('recipe: ' + JSON.stringify(recipe));
                    selectedRecipes.push(recipe);
                    resolve(selectedRecipes);
                });
            }
            else {
                reject('Error fetching recipes from API.');
            }
        });
    });
}
app.intent('MatchRecipes', function (conv, params) { return __awaiter(_this, void 0, void 0, function () {
    var ingredients, selectedRecipes, selectedNum, lastIndex, listItems, responses;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ingredients = params['ingredients'];
                selectedRecipes = [];
                console.log(ingredients);
                return [4 /*yield*/, fetchRecipes(ingredients, selectedRecipes)];
            case 1:
                _a.sent();
                console.log('selected: ' + JSON.stringify(selectedRecipes));
                selectedNum = selectedRecipes.length;
                lastIndex = selectedNum - 1;
                listItems = {};
                selectedRecipes.forEach(function (recipe, index) {
                    listItems[index] = {
                        title: recipe.title,
                        description: recipe.title,
                        image: new actions_on_google_1.Image({
                            url: recipe.image,
                            alt: recipe.title
                        })
                    };
                });
                // let optionsQuery = '';
                // let recipeOptions = {};
                // if (selectedNum == 1) {
                //   recipeOptions[1] = selectedRecipes[0];
                //   optionsQuery +=
                //     'Your only option is: ' +
                //     selectedRecipes[0].title +
                //     '. Would you like to cook this one today?';
                // } else {
                //   optionsQuery += 'These are your options: ';
                //   selectedRecipes.forEach((recipe, index, selectedRecipes) => {
                //     // Save the retrieved recipes to context
                //     recipeOptions[index + 1] = recipe;
                //     // List the options to the user
                //     optionsQuery += recipe.title;
                //     if (index == lastIndex) {
                //       optionsQuery += '. ';
                //     } else if (index == lastIndex - 1) {
                //       optionsQuery += ', and ';
                //     } else {
                //       optionsQuery += ', ';
                //     }
                //   });
                //   optionsQuery += 'Which one would you like choose? Option ';
                //   for (let i = 0; i < selectedNum; i++) {
                //     // We start counting from 0, but most users start with 1:)
                //     optionsQuery += i + 1;
                //     if (i == lastIndex) {
                //       optionsQuery += '?';
                //     } else if (i == lastIndex - 1) {
                //       optionsQuery += ', or ';
                //     } else {
                //       optionsQuery += ', ';
                //     }
                //   }
                // }
                if (selectedRecipes.length !== 0) {
                    responses = [];
                    conv.ask([new actions_on_google_1.List({ title: 'Selected recipes', items: listItems })]);
                }
                else {
                    // We don't have any possible recipes to offer
                    noRecipe(conv, '');
                }
                return [2 /*return*/];
        }
    });
}); });
var SELECTED_ITEM_RESPONSES = (_a = {},
    _a[0] = 'You selected the first item',
    _a[1] = 'You selected the second item',
    _a[2] = 'You selected the third item',
    _a);
app.intent('actions.intent.OPTION', function (conv, params, option) {
    var response = 'You did not select any item';
    if (option && SELECTED_ITEM_RESPONSES.hasOwnProperty(option)) {
        response = SELECTED_ITEM_RESPONSES[option];
    }
    conv.ask(response);
});
app.intent('PresentRecipe', function (conv, _a) {
    var number = _a.number;
    presentRecipe(conv, number);
});
app.intent('PresentSingleRecipe', function (conv) {
    presentRecipe(conv, 1);
});
app.intent('PresentNoRecipe', function (conv) {
    noRecipe(conv, 'other');
});
app.intent('RedirectToCookingApp', function (conv) {
    redirectToCookingApp(conv);
});
app.intent('Finish', function (conv) {
    finish(conv);
});
app.intent('RedirectSingleToCookingApp', function (conv) {
    redirectToCookingApp(conv);
});
app.intent('SingleFinish', function (conv) {
    finish(conv);
});
app.intent('Default Fallback Intent', function (conv) {
    conv.ask("I didn't catch that. Can you tell me something else?");
});
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
