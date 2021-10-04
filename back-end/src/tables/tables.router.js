const router = require("express").Router();
const controller = require("./tables.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router.route("/free").get(controller.listFree).all(methodNotAllowed);

router
  .route("/:table_id/seat/")
  .put(controller.seat)
  .delete(controller.unseat)
  .all(methodNotAllowed);

router
  .route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);

module.exports = router;
