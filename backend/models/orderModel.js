const { DataTypes } = require('sequelize');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../constants/enums');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    buyer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },

    order_number: {
      type: DataTypes.TEXT,
      unique: true,
    },

    items: {
      type: DataTypes.JSON, // JSONB incompatible SQLite
      allowNull: false,
    },

    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    delivery_fee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(...Object.values(ORDER_STATUS)),
      defaultValue: ORDER_STATUS.PENDING,
    },

    payment_status: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_STATUS)),
      defaultValue: PAYMENT_STATUS.PENDING,
    },

    delivery_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    delivery_city: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    delivery_coords: {
      type: DataTypes.JSON,
    },

    delivery_agency_id: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
    },

    buyer_notes: {
      type: DataTypes.TEXT,
    },

  }, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    hooks: {
      beforeCreate: async (order) => {
        if (!order.order_number) {
          // Récupérer le dernier ID
          const lastOrder = await Order.findOne({
            order: [['id', 'DESC']]
          });

          const nextId = lastOrder ? lastOrder.id + 1 : 1;

          // Générer : TRB20241201000001
          const date = new Date().toISOString().slice(0,10).replace(/-/g,''); // YYYYMMDD
          const padded = String(nextId).padStart(6, '0');

          order.order_number = `TRB${date}${padded}`;
        }
      }
    }
  });

  return Order;
};
