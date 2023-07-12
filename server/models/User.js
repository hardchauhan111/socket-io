module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define("users", {
		id: {
		  	type: DataTypes.INTEGER,
		  	primaryKey: true,
      		autoIncrement: true
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
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
	
	User.associate = (models) => {
		User.hasMany(models.Message, {
			foreignKey: 'user_id'
		});
	}
	return User;
};