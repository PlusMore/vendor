var BarclaysEvents = new Meteor.Collection

Meteor.methods({
  loadBarclaysEvents: function(url) {
    var shop = Shops.findOne({});
    url = url || 'http://www.barclayscenter.com/events';

    HTTP.get(url, function(err, results) {

      var $ = cheerio.load(results.content);
      $('.list .entry').map(function(i, entry) {
        var title = $(entry).find('.title a').text();
        var entryDetailsURL = $(entry).find('a.more').attr('href');

        var existingProduct = Products.findOne({title: title});

        if (!existingProduct) {
          Products.insert({
            title: title,
            vendor: 'Barclays',
            isVisible: false,
            productType: 'Simple',
            requiresShipping: false,
            handle: "",
            variants: [],
            shopId: shop && shop._id,
            metaDescription: entryDetailsURL
          });
        }

      });
    });
  },
  removeAllProducts: function() {
    Products.remove({});
  }
});

Products.find({vendor: 'Barclays'}).observe({
  added: function (document) {
    var detailsURL = document.metaDescription;


    HTTP.get(detailsURL, function(err, results) {

      if (err) {
        console.log('Could not load ', detailsURL);
        return err;
      }

      var $ = cheerio.load(results.content);

      $('.description').map(function(i, description) {
        var description = $(description).text();

        Products.update({_id: document._id}, {$set: {
          description: description
        }});

      });
    });

  }
});
