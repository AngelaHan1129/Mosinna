import app from "./app.js";
import db from "./db/index.js";

const port = process.env.PORT || 5000;
app.listen(port, async () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  await db.sequelize.authenticate().then(function (errors) {
    console.log(errors);
  });
  await db.sequelize.sync();
});
