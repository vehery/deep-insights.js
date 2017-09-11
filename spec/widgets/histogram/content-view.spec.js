var _ = require('underscore');
var specHelper = require('../../spec-helper');
var HistogramContentView = require('../../../src/widgets/histogram/content-view');
var HistogramWidgetModel = require('../../../src/widgets/histogram/histogram-widget-model');
var HistogramChartView = require('../../../src/widgets/histogram/chart');

describe('widgets/histogram/content-view', function () {
  beforeEach(function () {
    var vis = specHelper.createDefaultVis();
    this.dataviewModel = vis.dataviews.createHistogramModel(vis.map.layers.first(), {
      id: 'widget_3',
      column: 'col',
      column_type: 'number',
      source: {
        id: 'a0'
      }
    });
    this.dataviewModel.getLayerName = function () {
      return '< & ><h1>Hello</h1>';
    };

    this.originalData = this.dataviewModel.getUnfilteredDataModel();
    this.originalData.set({
      data: [{ bin: 10, max: 0 }, { bin: 3, max: 10 }],
      start: 0,
      end: 256,
      bins: 2
    });

    this.widgetModel = new HistogramWidgetModel({
      title: 'Howdy',
      attrsNames: ['title']
    }, {
      dataviewModel: this.dataviewModel
    });

    var oldFtech = this.dataviewModel.fetch;
    var widgetModel = this.widgetModel;
    this.dataviewModel.fetch = function (options) {
      oldFtech.call(this, options);
      widgetModel.attributes.hasInitialState = true;
      options && options.complete && options.complete();
    };

    spyOn(this.dataviewModel, 'getData').and.returnValue(['0', '1']);
    spyOn(this.dataviewModel, 'fetch').and.callThrough();

    spyOn(HistogramChartView.prototype, '_setupFillColor').and.returnValue('red');

    this.view = new HistogramContentView({
      model: this.widgetModel,
      dataviewModel: this.dataviewModel
    });
  });

  describe('originalData is not loaded', function () {
    it('should render histogram when originalData changes', function () {
      spyOn(this.view, 'render').and.callThrough();
      this.originalData.trigger('change:data', this.originalData);
      expect(this.view.render).toHaveBeenCalled();
      expect(this.view.$('h3').text()).toBe('Howdy');
    });

    it('should not fetch data until originalData changes', function () {
      expect(this.dataviewModel.fetch).not.toHaveBeenCalled();
      this.originalData.trigger('change:data', this.originalData);
      expect(this.dataviewModel.fetch).toHaveBeenCalled();
    });
  });

  describe('update stats', function () {
    it('should update the stats values', function () {
      expect(this.widgetModel.get('min')).toBe(undefined);
      expect(this.widgetModel.get('max')).toBe(undefined);
      expect(this.widgetModel.get('avg')).toBe(undefined);
      expect(this.widgetModel.get('total')).toBe(undefined);

      this.dataviewModel.getData.and.returnValue(JSON.stringify(genHistogramData(20)));
      this.dataviewModel.trigger('change:data');

      expect(this.widgetModel.get('min')).not.toBe(0);
      expect(this.widgetModel.get('max')).not.toBe(0);
      expect(this.widgetModel.get('avg')).not.toBe(0);
      expect(this.widgetModel.get('total')).not.toBe(0);
    });
  });

  describe('originalData is loaded', function () {
    beforeEach(function () {
      this.originalData.trigger('change:data', this.originalData);
    });

    it('should revert the lockedByUser state when the model is changed', function () {
      spyOn(this.view, '_unsetRange').and.callThrough();

      this.dataviewModel.sync = function (method, model, options) {
        options.success({
          'bin_width': 10,
          'bins_count': 2,
          'bins_start': 1,
          'nulls': 0,
          'bins': []
        });
      };

      this.widgetModel.set('zoomed', true);
      this.dataviewModel.fetch();

      expect(this.view._unsetRange).not.toHaveBeenCalled();

      this.view.lockedByUser = true;
      this.dataviewModel.set('url', 'test');

      expect(this.view.lockedByUser).toBe(true);
    });

    it("shouldn't revert the lockedByUser state when the url is changed and the histogram is zoomed", function () {
      this.dataviewModel.sync = function (method, model, options) {
        options.success({
          'bin_width': 10,
          'bins_count': 2,
          'bins_start': 1,
          'nulls': 0,
          'bins': []
        });
      };

      this.view.lockedByUser = true;
      this.dataviewModel.fetch();
      this.dataviewModel.trigger('change:data');
      expect(this.view.lockedByUser).toBe(false);
    });

    it('should unset the range when the data is changed', function () {
      this.dataviewModel.sync = function (method, model, options) {
        options.success({
          'bin_width': 10,
          'bins_count': 2,
          'bins_start': 1,
          'nulls': 0,
          'bins': []
        });
      };

      spyOn(this.view, '_unsetRange').and.callThrough();
      this.view.unsettingRange = true;
      this.dataviewModel.fetch();
      this.dataviewModel._data.reset(genHistogramData(20));
      this.dataviewModel.trigger('change:data');
      expect(this.view._unsetRange).toHaveBeenCalled();
    });

    it("shouldn't unset the range when the url is changed and is zoomed", function () {
      spyOn(this.view, '_unsetRange').and.callThrough();

      this.dataviewModel.sync = function (method, model, options) {
        options.success({
          'bin_width': 10,
          'bins_count': 2,
          'bins_start': 1,
          'nulls': 0,
          'bins': []
        });
      };

      this.widgetModel.set('zoomed', true);
      this.dataviewModel.fetch();

      expect(this.view._unsetRange).not.toHaveBeenCalled();

      this.view.unsettingRange = true;
      this.dataviewModel.set('url', 'test');

      expect(this.view._unsetRange).not.toHaveBeenCalled();
    });

    it('should update the stats when the data of the model has changed', function () {
      spyOn(this.view, '_updateStats').and.callThrough();
      this.dataviewModel._data.reset(genHistogramData(20));
      this.dataviewModel.trigger('change:data');
      expect(this.view._updateStats).toHaveBeenCalled();
      expect(this.dataviewModel.getData).toHaveBeenCalled();
    });

    it('should update the title when the model is updated', function () {
      this.view.render();
      expect(this.view.$el.html().indexOf('Howdy') !== -1).toBe(true);
      this.widgetModel.update({title: 'Cloudy'});
      this.view.render();
      expect(this.view.$el.html().indexOf('Cloudy') !== -1).toBe(true);
    });

    it('should enable and disable filters on the dataviewModel when zooming in and out', function () {
      this.dataviewModel.sync = function (method, model, options) {
        options.success({
          'bin_width': 10,
          'bins_count': 2,
          'bins_start': 1,
          'nulls': 0,
          'bins': []
        });
      };
      this.dataviewModel.fetch();
      spyOn(this.dataviewModel, 'enableFilter');
      this.view.$('.js-zoom').click();
      expect(this.dataviewModel.enableFilter).toHaveBeenCalled();
      spyOn(this.dataviewModel, 'disableFilter');
      this.view.$('.js-clear').click();
      expect(this.dataviewModel.disableFilter).toHaveBeenCalled();
    });

    it('should set and unset bounds for the histogram view when chart is zoomed in and zoomed out', function () {
      this.dataviewModel.sync = function (method, model, options) {
        options.success({
          'bin_width': 10,
          'bins_count': 2,
          'bins_start': 1,
          'nulls': 0,
          'bins': []
        });
      };
      this.dataviewModel.fetch();
      spyOn(this.view.histogramChartView, 'setBounds');
      spyOn(this.view.histogramChartView, 'unsetBounds');
      this.view.$('.js-zoom').click();
      expect(this.view.histogramChartView.setBounds).toHaveBeenCalled();
      this.view.$('.js-clear').click();
      expect(this.view.histogramChartView.unsetBounds).toHaveBeenCalled();
    });

    it('should replace histogram chart data with dataview model data when unsets range', function () {
      this.view.render();
      spyOn(this.view._originalData, 'toJSON');
      spyOn(this.view.histogramChartView, 'replaceData');
      this.view._unsetRange();
      expect(this.view.histogramChartView.replaceData).toHaveBeenCalled();
      expect(this.dataviewModel.getData).toHaveBeenCalled();
      expect(this.view._originalData.toJSON).not.toHaveBeenCalled();
    });

    it('should replace the data of the histogramChartView when user zooms in', function () {
      var i = 0;
      this.dataviewModel.sync = function (method, model, options) {
        options.success({
          'bin_width': 10,
          'bins_count': 2,
          'bins_start': i++,
          'nulls': 0,
          'bins': [{ bin: 0 }, { bin: 1 }]
        });
      };

      spyOn(this.view, '_onChangeZoomed').and.callThrough();
      this.view.render();

      spyOn(this.view.histogramChartView, 'replaceData');
      this.view.$('.js-zoom').click();
      expect(this.view._onChangeZoomed).toHaveBeenCalled();
      expect(this.view.histogramChartView.replaceData).toHaveBeenCalled();
    });

    it('should show stats when show_stats is true', function () {
      expect(this.view.$('.CDB-Widget-info').length).toBe(0);
      this.widgetModel.set('show_stats', true);
      this.view.render();
      expect(this.view.$('.CDB-Widget-info').length).toBe(1);
    });

    it('should hide nulls if dataview model doesnt have nulls defined', function () {
      spyOn(this.view._dataviewModel, 'hasNulls').and.returnValue(false);
      this.widgetModel.set('show_stats', true);
      this.view.render();
      expect(this.view.$('.js-nulls').length).toBe(0);
    });

    it('should show source when show_source is true', function () {
      expect(this.view.$('.CDB-Widget-info').length).toBe(0);
      this.widgetModel.set('show_source', true);
      this.view.render();
      expect(this.view.$('.CDB-Widget-info').length).toBe(1);
      expect(this.view.$('.u-altTextColor').html()).toBe('&lt; &amp; &gt;&lt;h1&gt;Hello&lt;/h1&gt;');
    });

    it('should render the widget when the layer name changes', function () {
      spyOn(this.view, 'render');
      this.view._initBinds();
      this.dataviewModel.layer.set('layer_name', 'Hello');
      expect(this.view.render).toHaveBeenCalled();
    });

    it('should collapse properly', function () {
      expect(this.view.$('.CDB-Widget-content').length).toBe(1);
      this.widgetModel.set('collapsed', true);
      expect(this.view.$('.CDB-Widget-content').length).toBe(0);
    });

    it('should update data and original data of the mini histogram if there is a data change and it is not zoomed', function () {
      var i = 0;
      this.dataviewModel.sync = function (method, model, options) {
        options.success({
          'bin_width': 10,
          'bins_count': 2,
          'bins_start': i++,
          'nulls': 0,
          'bins': []
        });
      };

      this.dataviewModel.fetch();

      spyOn(this.view, '_isZoomed').and.returnValue(false);
      spyOn(this.view.miniHistogramChartView, 'replaceData');
      // Change data
      this.originalData.trigger('change:data', this.originalData);
      expect(this.view.miniHistogramChartView.replaceData).toHaveBeenCalled();
    });

    it('should remove previous filter if there is a data change', function () {
      var i = 0;
      this.dataviewModel.sync = function (method, model, options) {
        options.success({
          'bin_width': 10,
          'bins_count': 2,
          'bins_start': i++,
          'nulls': 0,
          'bins': []
        });
      };

      this.dataviewModel.fetch();

      spyOn(this.dataviewModel, 'disableFilter');
      spyOn(this.view.filter, 'unsetRange');
      // Change data
      this.originalData.set('bins', 122, { silent: true });
      this.originalData.trigger('change:data', this.originalData);
      expect(this.dataviewModel.disableFilter).toHaveBeenCalled();
      expect(this.view.filter.unsetRange).toHaveBeenCalled();
      expect(this.view.model.get('filter_enabled')).toBeFalsy();
      expect(this.view.model.get('lo_index')).toBeFalsy();
      expect(this.view.model.get('hi_index')).toBeFalsy();
    });

    it('should reset widget if number of bins is changed', function () {
      this.view._unbinds();
      spyOn(this.view, '_resetWidget');
      this.view._setupBindings();
      var prevBins = this.view._dataviewModel.get('bins') || 10;

      this.view._dataviewModel.set('bins', prevBins + 1);

      expect(this.view._resetWidget).toHaveBeenCalled();
    });
  });

  afterEach(function () {
    this.view.clean();
  });
});

function genHistogramData (n) {
  n = n || 1;
  var arr = [];
  _.times(n, function (i) {
    var start = (100 * i) + Math.round(Math.random() * 1000);
    var end = start + 100;
    var obj = {
      bin: i,
      freq: Math.round(Math.random() * 10),
      avg: Math.round(Math.random() * 10),
      start: start,
      end: end,
      max: end,
      min: start
    };
    arr.push(obj);
  });
  return arr;
}
