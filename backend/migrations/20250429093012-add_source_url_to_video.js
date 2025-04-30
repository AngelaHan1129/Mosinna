'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('video', 'url', {
            allowNull: true,
            type: Sequelize.STRING(1024),
        })
        await queryInterface.addColumn('video', 'source', {
            allowNull: true,
            type: Sequelize.STRING,
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('video', 'url')
        await queryInterface.removeColumn('video', 'source')
    },
}
