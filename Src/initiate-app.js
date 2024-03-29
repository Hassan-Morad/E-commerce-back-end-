import db_connection from "../DB/connection.js";
import * as Routes from './Modules/index.routes.js'
import { globalResponse } from "./middlewares/global-response.middleware.js";
import { rollbackSavedDocuments } from "./middlewares/rollback-saved-documnets.middleware.js";
import { rollbackUploadedFiles } from "./middlewares/rollback-uploaded-files.middleware.js";
import { cronToChangeExpiredCoupons } from "./utils/crons.js";

export const initiateApp = (express) => {
  const app = express();
  const port = process.env.PORT;
  db_connection();
  cronToChangeExpiredCoupons()
  app.use(express.json())
  app.use('/user',Routes.userRouter)
  app.use('/auth',Routes.authRouter)
  app.use('/category',Routes.categoryRouter)
  app.use('/subCategory',Routes.subCategoryRouter)
  app.use('/brand',Routes.brandRouter)
  app.use('/product',Routes.productRouter)
  app.use('/cart',Routes.cartRouter)
  app.use('/coupon',Routes.couponRouter)
  app.use('/order',Routes.orderRouter)


  app.use(globalResponse,rollbackUploadedFiles,rollbackSavedDocuments)

  app.get("/", (req, res) => res.send("Hello World!"));
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
};
