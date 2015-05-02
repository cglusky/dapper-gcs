define(['backbone', 'JST',
    'routines/components/Views/MapCacheLoader'
], function(Backbone, templates, MapCacheLoaderView) {

    var Planning = Backbone.View.extend({

        el: '#planning',
        template: templates['app/routines/freeFlight/Templates/planning'],

        // Pull in options for automatic assignment of properties.
        initialize: function(options) {
            this.options = options || {};
        },

        events: {
            'click .continue': 'continue',
            'change input': 'updateParameters',
            'change select': 'updateParameters',
            'change input[name="maxAltitude"]': 'metersToFeet',
            'change input[name="takeoffAltitude"]': 'metersToFeet'
        },

        updateParameters: function(e) {
            this.model.set(e.currentTarget.name, e.currentTarget.value);
            this.model.save();
        },

        metersToFeet: function() {
            var metersToFeetTemplate = _.template("<span><%= feet %></span>ft");

            this.$el.find('.toFeet').html(
                metersToFeetTemplate({
                    feet: parseInt(this.$('#maxAltitude')[0].value * 3.28084, 10)
                })
            );
            this.$el.find('.takeoffAltitudeToFeet').html(
                metersToFeetTemplate({
                    feet: parseInt(this.$('#takeoffAltitude')[0].value * 3.28084, 10)
                })
            );
        },

        continue: function() {
            this.options.deferred.resolve();
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            $('#equipmentChecklist').click(function() {
                window.open('/checklist', 'Equipment Checklist');
            });
            this.mapDownloader = new MapCacheLoaderView();
            this.mapDownloader.render();
            this.metersToFeet();
            return this;
        }

    });

    return Planning;

});
