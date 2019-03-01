import { Image, List } from 'actions-on-google';

const unirest = require('unirest');

const functions = require('firebase-functions');

const { dialogflow } = require('actions-on-google');

const app = dialogflow();

// function Recipe(name: string, ingredients: string[]) {
//   this.name = name;
//   this.ingredients = ingredients;
// }

function presentRecipe(conv, number: number) {
  let chosenRecipe = conv.contexts.get('recipe-options').parameters[number];
  conv.user.storage.currentRecipe = chosenRecipe;
  conv.ask(
    'Wonderful. Excellent choice! Would you like assistance with cooking ' +
      chosenRecipe.title +
      '?'
  );
}

function redirectToCookingApp(conv) {
  let chosenRecipe = conv.user.storage.currentRecipe;
  conv.close(
    'To enlist a cooking assistant to guide you while you cook, say: find me ' +
      chosenRecipe.title +
      ' to Google assistant after leaving this application. Bon appetit!'
  );
}

function finish(conv) {
  conv.close('You must be a pro then. Good luck and bon appetit!');
}

function noRecipe(conv, single: string) {
  conv.close(
    'Unfortunately, we have not found any ' +
      single +
      ' matching recipe for your ingredients. You might consider paying a visit to a grocery store.'
  );
}

// How many recipes to select?
const maxSelectedNum = 3;

app.intent('WelcomeAndLearnIngredients', conv => {
  conv.ask(
    'Welcome to Fridge Manager. Which ingredients do you have available? For example, you can say onion, potatoes, and salt.'
  );
});

// Retrieve matched recipes from Spoonacular
function fetchRecipes(ingredients, selectedRecipes) {
  // Contruct the API request string
  let getString: string =
    'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/findByIngredients?number=3&ranking=1&ingredients=';
  ingredients.forEach((ingredient: string, index: number) => {
    getString += ingredient;
    if (index != ingredients.length - 1) {
      getString += '%2C';
    }
  });

  console.log(getString);

  // External API call returns a Promise
  return new Promise((resolve, reject) => {
    unirest
      .get(getString)
      .header(
        'X-RapidAPI-Key',
        'bcd6824181msh975176809d91b13p14cf9djsn709a7caa5d1c'
      )
      .end(function(response) {
        if (response) {
          console.log(response.status, response.headers, response.body);
          response.body.forEach(recipe => {
            console.log('recipe: ' + JSON.stringify(recipe));
            selectedRecipes.push(recipe);
            resolve(selectedRecipes);
          });
        } else {
          reject('Error fetching recipes from API.');
        }
      });
  });
}

app.intent('MatchRecipes', async (conv, params: object) => {
  let ingredients: string[] = params['ingredients'];
  let selectedRecipes: any[] = [];
  console.log(ingredients);

  await fetchRecipes(ingredients, selectedRecipes);

  console.log('selected: ' + JSON.stringify(selectedRecipes));

  let listItems = {};
  let recipeOptions = {};
  selectedRecipes.forEach((recipe, index) => {
    listItems[index] = {
      title: recipe.title,
      description: recipe.title,
      image: new Image({
        url: recipe.image,
        alt: recipe.title
      })
    };

    // Save the retrieved recipes to context
    recipeOptions[index] = recipe;
  });

  if (selectedRecipes.length !== 0) {
    conv.contexts.set('recipe-options', 10, recipeOptions);

    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
      conv.ask(
        'Sorry, try this on a screen device or select the ' +
          'phone surface in the simulator.'
      );
      return;
    }

    // Present a list
    conv.ask('Here is a list of matched recipes');
    conv.ask(new List({ title: 'Your options', items: listItems }));
  } else {
    // We don't have any possible recipes to offer
    noRecipe(conv, '');
  }
});

app.intent('PresentRecipe', (conv, params, option) => {
  presentRecipe(conv, option);
});

app.intent('PresentSingleRecipe', conv => {
  presentRecipe(conv, 1);
});

app.intent('PresentNoRecipe', conv => {
  noRecipe(conv, 'other');
});

app.intent('RedirectToCookingApp', conv => {
  redirectToCookingApp(conv);
});

app.intent('Finish', conv => {
  finish(conv);
});

app.intent('RedirectSingleToCookingApp', conv => {
  redirectToCookingApp(conv);
});

app.intent('SingleFinish', conv => {
  finish(conv);
});

app.intent('Default Fallback Intent', conv => {
  conv.ask(`I didn't catch that. Can you tell me something else?`);
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
