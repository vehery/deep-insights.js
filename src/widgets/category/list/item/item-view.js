var cdb = require('cartodb.js');
var formatter = require('../../../../formatter');
var _ = require('underscore');
var clickableTemplate = require('./item-clickable-template.tpl');
var unclickableTemplate = require('./item-unclickable-template.tpl');

/**
 * Category list item view
 */
module.exports = cdb.core.View.extend({
  tagName: 'li',
  className: 'CDB-Widget-listItem',

  events: {
    'click .js-button': '_onItemClick'
  },

  initialize: function (options) {
    this.widgetModel = this.options.widgetModel;
    this.dataviewModel = this.options.dataviewModel;
    this._initBinds();
  },

  render: function () {
    var name = this.model.get('name');
    var value = this.model.get('value');
    var template = this.model.get('agg') || this.widgetModel.isLocked()
      ? unclickableTemplate
      : clickableTemplate;
    var acceptedCategories = this.dataviewModel.filter.getAcceptedCategoryNames();
    var isAccepted = _.contains(acceptedCategories, name);

    this.$el.html(
      template({
        isAggregated: this.model.get('agg'),
        name: name,
        value: value,
        formattedValue: formatter.formatNumber(value),
        percentage: ((value / this.dataviewModel.get('max')) * 100),
        color: this.widgetModel.getColor(name),
        isDisabled: !this.model.get('selected') ? 'is-disabled' : '',
        isAccepted: isAccepted,
        prefix: this.widgetModel.get('prefix'),
        suffix: this.widgetModel.get('suffix')
      })
    );

    return this;
  },

  _initBinds: function () {
    this.model.bind('change', this.render, this);
    this.widgetModel.bind('change:search change:prefix change:suffix change:autoStyle', this.render, this);
    this.add_related_model(this.widgetModel);
  },

  _onItemClick: function () {
    this.trigger('itemClicked', this.model, this);
  }

});
