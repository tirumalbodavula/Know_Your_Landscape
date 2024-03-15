var block1 = ee.FeatureCollection('projects/ee-dharmisha-siddharth/assets/Pindwara/Pindwara_uid'); // sirohi
var block2 = ee.FeatureCollection('projects/ee-dharmisha-siddharth/assets/Mandalgarh/Mandalgarh_uid'); // bhilwara
var block3 = ee.FeatureCollection('projects/ee-dharmisha-siddharth/assets/Mohanpur/Mohanpur_uid'); // gaya
var block4 = ee.FeatureCollection('projects/ee-dharmisha-siddharth/assets/Masalia/Masalia_uid'); // dumka
var block5 = ee.FeatureCollection('projects/ee-dharmisha-siddharth/assets/Angul_uid'); // angul

var blockBoundry1 = ee.FeatureCollection('projects/ee-anz208490/assets/pindwara_block_boundary');
var blockBoundry2 = ee.FeatureCollection('projects/ee-anz208490/assets/mandalgarh_block_boundary');
var blockBoundry3 = ee.FeatureCollection('projects/ee-anz208490/assets/mohanpur_block_boundary');
var blockBoundry4 = ee.FeatureCollection('projects/ee-anz208490/assets/masalia_block_boundary');
var blockBoundry5 = ee.FeatureCollection('projects/ee-anz208490/assets/angul_block_boundary');

var block_name1 = 'Pindwara';
var block_name2 = 'Mandalgarh';
var block_name3 = 'Mohanpur';
var block_name4 = 'Masalia';
var block_name5 = 'Angul';

var district1_works = ee.FeatureCollection('projects/ee-rittwick-tirumal/assets/SIROHI');
var district2_works = ee.FeatureCollection('projects/ee-rittwick-tirumal/assets/BHILWARA');
var district3_works = ee.FeatureCollection('projects/ee-rittwick-tirumal/assets/GAYA');
var district4_works = ee.FeatureCollection('projects/ee-rittwick-tirumal/assets/DUMKA');
var district5_works = ee.FeatureCollection('projects/ee-rittwick-tirumal/assets/ANGUL');

function getYear(dateString) {
  dateString = ee.String(dateString);
  dateString = dateString.trim();

  // Split the date string using delimiters -.-/. and remove empty parts
  var parts = dateString.split('[-./]');

  var cond1 = ee.Number(parts.size()).lt(3);
  var year = ee.Algorithms.If(cond1, 1888, ee.Number(parts.get(2)));
  return year;
}

var id=2;
var block = eval('block'+ id);
var district_works = eval('district'+id+'_works');
var blockBoundry = eval('blockBoundry'+id);
var block_name = eval('block_name'+id);

var works_cur_cat = ee.List(['Irrigation - Site level impact', 'SWC - Landscape level impact', 'Plantation', 'Household Livelihood', 'Agri Impact - HH,  Community', 'Others - HH, Community', 'Irrigation Site level - Non RWH', 'Un Identified']);

district_works = district_works.map(function(work){
  var lat = ee.Number(ee.Feature(work).get('lat'));
  var lon = ee.Number(ee.Feature(work).get('lon'));
  lat = ee.Algorithms.If(lat, lat, 0);
  lon = ee.Algorithms.If(lon, lon, 0);
  work = work.setGeometry(ee.Geometry.Point([lon, lat]));
  work = work.set('loc', ee.Geometry.Point([lon, lat]));
  var rawDate = work.get('Work_start_date');
  rawDate = ee.Algorithms.If(rawDate, rawDate, '11-11-1888');
  var year = getYear(rawDate);
  work = work.set('year', year);
  return work;
});


block = ee.FeatureCollection(block);

print('Total number of works done in district ', district_works.size());
print('The years in which there is atleast work is done', district_works.aggregate_array('year').distinct());

var filter2 = ee.Filter.isContained('loc', blockBoundry.geometry());
var district_works = district_works.filter(filter2);
print('Total number of works done in block '+block_name, district_works.size());


block = block.map(function(roi){
  roi = ee.Feature(roi);
  var fil = ee.Filter.isContained('loc', roi.geometry());
  var works = district_works.filter(fil);
  works = works.map(function(work){
    work = work.set('uid', roi.get('uid'));
    return work;
  });
  return works;
}).flatten();

print(block.limit(10));

Export.table.toDrive({
  collection: block,
  description:block_name+'_nrega_works',
  fileFormat: 'CSV'
});
