const path = require("path");
// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function orderExists(req, res, next){
    const orderId = req.params.orderId;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
        res.locals.order = foundOrder;
        return next();
    }
    next({
        status: 404,
        message: `Order id not found: ${req.params.orderId}`,
    });
}

function validOrder(req, res, next){
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;

        if (!deliverTo || deliverTo === "") {
            return next({
                status: 400,
                message: "Order must include a deliverTo"
            });
        }
        if (!mobileNumber || mobileNumber === "") {
            return next({
                status: 400,
                message: "Order must include a mobileNumber"
            });
        }

        if (!dishes) {
            return next({
                status: 400,
                message: "Order must include a dish"
            });
        }

        if (dishes.length === 0 || !Array.isArray(dishes)) {
            return next({
                status: 400,
                message: "Order must include at least one dish"
            });
        }
        for (let i=0; i<dishes.length; i++) {
            const quantity = dishes[i].quantity;
            if (!quantity || quantity <= 0 || typeof(quantity) !== "number") {
                return next({
                    status: 400,
                    message: `Dish ${i} must have a quantity that is an integer greater than 0`
                });
            }    

        }
    next();
}

function validId(req, res, next){
    const { data: { id, status } = {} } = req.body;
    if (id) {
        if (req.params.orderId !== id) {
            return next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${req.params.orderId}`,
            });
        }
    }
    if (!status || status.length === 0 || status === 'invalid'){
        return next({
            status: 400,
            message: 'Order must have a status of pending, preparing, out-for-delivery, delivered'
        })
    }
    
      next();
}

function isPending(req, res, next){
    if (res.locals.order.status !== "pending") {
        return next({
          status: 400,
          message: "An order cannot be deleted unless it is pending"
        });
    }
    next();
}

function list(req, res) {
    res.json({ data: orders})
}

function create(req, res){
    const { 
        data: {
            deliverTo, 
            mobileNumber, 
            status, 
            dishes 
          } = {} } = req.body;

    const newOrder = {
        id: nextId(),
        deliverTo: deliverTo,
        mobileNumber: mobileNumber,
        status: status,
        dishes: dishes
    }
    orders.push(newOrder);
    res.status(201).json({ data: newOrder })
}

function read(req, res){
    res.json({ data: res.locals.order })
}

function update(req, res){
    const { data: { deliverTo, mobileNumber, dishes, status } = {} } = req.body;
    res.locals.order.id = req.params.orderId;
    res.locals.order.deliverTo = deliverTo;
    res.locals.order.mobileNumber = mobileNumber;
    res.locals.order.status = status;
    res.locals.order.dishes = dishes;
    res.json({ data: res.locals.order })
}

function destroy(req, res){
    const index = orders.findIndex((order) => order.id === req.params.orderId);
    orders.slice(index, 1);
    res.sendStatus(204);
}

module.exports = {
    list,
    create: [validOrder, create],
    read: [orderExists, read],
    update: [orderExists, validId, validOrder, update],
    delete: [orderExists, isPending, destroy]
}