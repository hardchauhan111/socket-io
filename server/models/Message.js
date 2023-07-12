const User = require('../models/User');
module.exports = (sequelize, DataTypes) => {
	const Message = sequelize.define("messages", {
		id: {
		  	type: DataTypes.INTEGER,
		  	primaryKey: true,
      		autoIncrement: true
		},
		user_id: {
			type: DataTypes.INTEGER,
		},
		message: {
			type: DataTypes.STRING,
			allowNull: false
		},
		edited: {
		  	type: DataTypes.STRING,
		},
		created_at: {
		  	type: DataTypes.DATE,
		},
		updated_at: {
		  	type: DataTypes.DATE,
		}
	}, {
		timestamps: false
	});
	Message.associate = (models) => {
		Message.belongsTo(models.User, {
			foreignKey: 'user_id'
		});
	}
	return Message;
};