import app from './app'
import db from './db'
import 'dotenv/config'

const port = process.env.PORT || 5000
app.listen(port, async () => {
    /* eslint-disable no-console */
    console.log(`Listening: http://localhost:${port}`)
    await db.sequelize.authenticate().then((errors) => {
        console.log(errors)
    })
})
