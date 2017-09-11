var cdb = require('cartodb.js');
var SearchTitleView = require('./title/search-title-view');
var CategoryOptionsView = require('./options/options-view');
var CategoryItemsView = require('./list/items-view');
var CategoryStatsView = require('./stats/stats-view');
var CategoryPaginatorView = require('./paginator/paginator-view');
var SearchCategoryItemsView = require('./list/search-items-view');
var SearchCategoryPaginatorView = require('./paginator/search-paginator-view');
var template = require('./content-template.tpl');

/**
 * Content view for category widget
 */
module.exports = cdb.core.View.extend({
  className: 'CDB-Widget-body',

  _ITEMS_PER_PAGE: 6,

  initialize: function () {
    this._dataviewModel = this.model.dataviewModel;
    this._initBinds();
  },

  render: function () {
    this.clearSubViews();
    this.$el.html(template());
    this._initViews();
    return this;
  },

  _initBinds: function () {
    if (this.model.get('hasInitialState') === true) {
      this._onInitialState();
    } else {
      this.model.bind('change:hasInitialState', this._onInitialState, this);
    }
    this.model.bind('change:collapsed', function (mdl, isCollapsed) {
      this.$el.toggleClass('is-collapsed', !!isCollapsed);
    }, this);
  },

  _onInitialState: function () {
    this.render();

    if (this.model.get('autoStyle') === true) {
      this.model.autoStyle();
    }
  },

  _initViews: function () {
    var searchTitle = new SearchTitleView({
      widgetModel: this.model,
      dataviewModel: this._dataviewModel
    });
    this.$('.js-header').append(searchTitle.render().el);
    this.addView(searchTitle);

    var stats = new CategoryStatsView({
      widgetModel: this.model,
      dataviewModel: this._dataviewModel
    });
    this.$('.js-header').append(stats.render().el);
    this.addView(stats);

    var options = new CategoryOptionsView({
      widgetModel: this.model,
      dataviewModel: this._dataviewModel
    });
    this.$('.js-content').html(options.render().el);
    this.addView(options);

    var dataList = new CategoryItemsView({
      widgetModel: this.model,
      dataviewModel: this._dataviewModel,
      itemsPerPage: this._ITEMS_PER_PAGE
    });
    this.$('.js-content').append(dataList.render().el);
    this.addView(dataList);

    var pagination = new CategoryPaginatorView({
      $target: dataList.$el,
      widgetModel: this.model,
      dataviewModel: this._dataviewModel,
      itemsPerPage: this._ITEMS_PER_PAGE
    });
    this.$('.js-footer').append(pagination.render().el);
    this.addView(pagination);

    var searchList = new SearchCategoryItemsView({
      widgetModel: this.model,
      dataviewModel: this._dataviewModel,
      itemsPerPage: this._ITEMS_PER_PAGE,
      paginator: true
    });
    this.$('.js-content').append(searchList.render().el);
    this.addView(searchList);

    var searchPagination = new SearchCategoryPaginatorView({
      $target: searchList.$el,
      widgetModel: this.model,
      dataviewModel: this._dataviewModel,
      itemsPerPage: this._ITEMS_PER_PAGE,
      paginator: true
    });
    this.$('.js-footer').append(searchPagination.render().el);
    this.addView(searchPagination);
  }

});
