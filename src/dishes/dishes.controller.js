const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function dishExists(req, res, next){
    const dishId = req.params.dishId;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
        res.locals.dish = foundDish;
        return next();
    }
    next({
        status: 404,
        message: `Dish id not found: ${req.params.dishId}`,
    });
}

function validDish(req, res, next){
    const { data: {
            name, 
            description, 
            price, 
            image_url } = {}} = req.body;
    
        if (!name || name === "") {
            return next({
                status: 400,
                message: "Dish must include a name",
            });
        }
        if (!description) {
            return next({
                status: 400,
                message: "Dish must include a description",
            });
        }
        if (!price || price === "" || price <= 0 || typeof(price) !== "number") {
            return next({
                status: 400,
                message: "Dish must have a price that is an integer greater than 0",
            });
        }
        if (!image_url) {
            return next({
                status: 400,
                message: "Dish must include a image_url",
            });
        }    
    next();
}

function validId(req, res, next){
    const { data: {id} = {} } = req.body;
    if (!req.params.dishId) {
        return next({
          status: 404,
          message: `Dish does not exist ${req.params.dishId}`,
        });
    }
    if (id) {
        if (req.params.dishId !== id) {
            return next({
              status: 400,
              message: `Dish id does not match route id. Dish: ${id}, Route: ${req.params.dishId}`,
            });
        }
    }

    next();
}

function list(req, res){
    res.json({ data: dishes})
}

function create(req, res){
    const { data: { name, description, price, image_url } = {} } = req.body;
    const newDish = {
        id: nextId(),
        name: name,
        description: description,
        price: price,
        image: image_url
    }
    dishes.push(newDish);
    res.status(201).json({ data: newDish })
}

function read(req, res){
    res.json({ data: res.locals.dish })
}

function update(req, res){
    const { data: { name, description, price, image_url } = {} } = req.body;
    res.locals.dish.name = name;
    res.locals.dish.description = description;
    res.locals.dish.price = price;
    res.locals.dish.image_url = image_url;
    res.json({ data: res.locals.dish })
}

module.exports = {
    list,
    create: [validDish, create],
    read: [dishExists, read],
    update: [dishExists, validDish, validId, update]
}