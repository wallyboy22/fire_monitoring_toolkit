// 1-Export_amostras_mosaicos_Sentinel.js -> toolkit de visualização de
// multiplos dados do sensoriamento remoto voltados para o monitoramento
// de fogo no Brasil 

// Author: Wallace Silva e Vera Laísa 
// Institution: IPAM

//__________________________________________________________________________________________________________
// 1.0 - 02/03/2022 - Primeira versão sistematizada - https://code.earthengine.google.com/5d0c6ec188b717d8892b4abd497bb4e2
// 1.1 - 03/03/2022 - O modulo de thumbnails ".setThumbs()" foi desinstalado e no lugar foi desenvolvido e instalado o "plotThumbnails",
// disparado na atualização do painel - https://code.earthengine.google.com/74d93ccd773c05f8c7004abd6aaa2c4c


//__________________________________________________________________________________________________________


// --- --- --- INITIAL INPUTS AND CACHE MEMORY
var options = {
  // --- --- opções pré carregadas na interface
  region_table:'Regioes',
  region:'Pantanal_r1',
  year:2019, 
  month:'01',
  month_int:1,
  sample_version: 'v2', // <- CONTROLE DO VERSIONAMENTO DOS DADOS EXPORTADOS
  
  folder_toAsset:'projects/mapbiomas-workspace/FOGO/AMOSTRAS_SENTINEL/',
  
  dimensions:512,
  openThumbs:false,
  
  // --- Este toolkit funciona com base em funções que percorrem listas acessando datasets, 
  // esta sessão é feita para o gerenciamento dessas listas
  
  // - assets de cicatrizes pre-processadas em uma unica imagem, com bandas anuais.
  scar_images: [
    // 'mcd64a1', 'fire_cci','firms',
    'MapBiomas Colecao 1',
    // 'INPE focos de calor',
    'MapBiomas Fogo mensal s2 (v2)'
  ],
  // - 
  hotspot: [
    'BUFFER-FOCUS',
  ],
  // - assets de cicatrizes pre-processadas em uma unica imagem, com bandas anuais
  models: [
    // 'monthly',
    // 'burned_cover','acumulated','acumulated_cover','frequency', 'synYearFire',
    'ano',
  ],
  // - coleções de imagens de satélites
  collection_sr: [
    // 'terra','aqua','landsat_4',// 'landsat_7'
    'landsat_5','landsat_8','sentinel_2',
    // 'planet',
  ],
  // - coleções de imagens de cicatrizes de fogo
  collection_scar:[
    'MCD64A1','FIRMS', 'FIRE_CCI','MapBiomas Fogo Sentinel 2 (v1)',
    'MapBiomas Fogo Sentinel 2 (v2)','MapBiomas Fogo mensal Sentinel 2 (v2)',
  ],
  // - vetores transformados em linha -> auxiliar
  region_vis: [
    'line','lines','Quadriculas'/*,'square'*/
  ],
  
  // -> vetores utilizados na seleção da região  
  auxiliar: [
    'Paises','Biomas','Regioes','Estados','Municipios','UC','Landsat_tile','Quadriculas','Estudo de caso'/*,'Tela'*/
  ],

  // -> bandas exportadas no mosaico
  bands_export:[
    'red','nir','swir1','swir2', 'landcover' // manter o landcover como ultima variavel da lista
    ],
  
  // -> lista com imagens endereço de imagens bloqueadas 
  blockList_landsat: require('users/geomapeamentoipam/GT_Fogo_MapBiomas:2_Colecao_1.0_2021/module-blockList').blockList(),
  blockList_sentinel: require('users/geomapeamentoipam/GT_Fogo_MapBiomas:3- Monitoramento Fogo/module-blockList-sentinel_2').blockList(),
  
  // --- Layers que devem ja vir ligadas
  // - (on layers)
  'Limite':true,
  // sentinel_2:true,
  // landsat_5:true,
  'MapBiomas Fogo Sentinel 2 (v1)':true,
  // 'MapBiomas Colecao 1':true,
  
};

var dataset = {
  // --- --- --- DATASETS ARMAZENADOS EM OBJETOS
  // --- --- raster
  // --- modelos de cicatrizes em images, com bandas armazenadas anualmente 
  'MapBiomas Colecao 1':{
    // modelos
    monthly:{
      image:ee.Image('projects/mapbiomas-workspace/public/collection6/mapbiomas-fire-collection1-monthly-burned-coverage-1')
        .divide(100)
        .int(),
      visParams:{
        min:1,
        max:12,
        palette:[
          // 'a900ff', '6f02ff', '020aff', '0675ff', '06ffff', 'ffee00', 'ff7700', 'ff0800', 'c20202', '0aa602',
          '0cff00'
          ],
        bands:'burned_coverage_' + options.year,
      }
    },
    'ano':{
      image:ee.Image('projects/mapbiomas-workspace/public/collection6/mapbiomas-fire-collection1-monthly-burned-coverage-1')
        .gte(1),
      visParams:{
        min:0,
        max:1,
        palette:['800000'],
        bands:'burned_coverage_' + options.year,
      }
    },
    burned_cover:{
      image:ee.Image('projects/mapbiomas-workspace/public/collection6/mapbiomas-fire-collection1-monthly-burned-coverage-1').mod(100),
      visParams:{
        min:0,
        max:49,
        palette:require('users/mapbiomas/modules:Palettes.js').get('classification6'),
        bands:'burned_coverage_' + options.year,
      }
    },
    acumulated:{
      image:ee.Image('projects/mapbiomas-workspace/public/collection6/mapbiomas-fire-collection1-fire-frequency-1')
        .gte(1)
,
      visParams:{
        min:0,
        max:1,
        palette:['ff0000'],
        bands:'fire_frequency_1985_' + options.year,
      }
    },
    acumulated_cover:{
      image:ee.Image('projects/mapbiomas-workspace/public/collection6/mapbiomas-fire-collection1-fire-frequency-1')
        .mod(100)
,
     visParams:{
        min:0,
        max:49,
        palette:require('users/mapbiomas/modules:Palettes.js').get('classification6'),
        bands:'fire_frequency_1985_' + options.year,
      }
    },
    frequency:{
      image:ee.Image('projects/mapbiomas-workspace/public/collection6/mapbiomas-fire-collection1-fire-frequency-1')
        .divide(100)
        .int()
,
      visParams:{
        min:1,
        max:36,
        palette:['ffffff','F8D71F','DAA118','BD6C12','9F360B','810004','4D0709'],
        bands:'fire_frequency_1985_' + options.year,
      }
    },
    synYearFire:{
      image:ee.Image('projects/mapbiomas-workspace/SEEG/2021/FIRE_DYNAMICS/mapbiomas-fire-collection1-year-since-fire-v1'),
      visParams:{
        min:1,
        max:options.year - 1985,
        palette:['a900ff', '6f02ff', '020aff', '0675ff', '06ffff', 'ffee00', 'ff7700', 'ff0800', 'c20202', '0aa602', '0cff00'],
        bands:'classification_' + options.year,
      }
    },
    // - delimita a responsividade na seleção do ano
    period:{
      start:1985,
      end:2020
    }
  },
  mcd64a1:{
    monthly:{
      image:ee.Image('projects/mapbiomas-workspace/FOGO1/monthly-coverage-mcd64a1-v2')
        .divide(100)
        .int(),
      visParams:{
        min:1,
        max:12,
        palette:['a900ff', '6f02ff', '020aff', '0675ff', '06ffff', 'ffee00', 'ff7700', 'ff0800', 'c20202', '0aa602', '0cff00'],
        bands:'burned_coverage_' + options.year,
      }
    },
    'ano':{
      image:ee.Image('projects/mapbiomas-workspace/FOGO1/monthly-coverage-mcd64a1-v2')
        .gte(1),
      visParams:{
        min:0,
        max:1,
        palette:['800000'],
        bands:'burned_coverage_' + options.year,
      }
    },
    burned_cover:{
      image:ee.Image('projects/mapbiomas-workspace/FOGO1/monthly-coverage-mcd64a1-v2')
        .mod(100),
      visParams:{
        min:0,
        max:49,
        palette:require('users/mapbiomas/modules:Palettes.js').get('classification6'),
        bands:'burned_coverage_' + options.year,
      }
    },
    acumulated:{
      image:ee.Image('projects/mapbiomas-workspace/FOGO1/frequency-coverage-mcd64a1-v2')
        .gte(1),
      visParams:{
        min:0,
        max:1,
        palette:['ff0000'],
        bands:'fire_frequency_2001_' + options.year,
      }
    },
    acumulated_cover:{
      image:ee.Image('projects/mapbiomas-workspace/FOGO1/frequency-coverage-mcd64a1-v2')
        .mod(100),
     visParams:{
        min:0,
        max:49,
        palette:require('users/mapbiomas/modules:Palettes.js').get('classification6'),
        bands:'fire_frequency_2001_' + options.year,
      }
    },
    frequency:{
      image:ee.Image('projects/mapbiomas-workspace/FOGO1/frequency-coverage-mcd64a1-v2')
        .divide(100)
        .int(),
      visParams:{
        min:1,
        max:36,
        palette:['ffffff','F8D71F','DAA118','BD6C12','9F360B','810004','4D0709'],
        bands:'fire_frequency_2001_' + options.year,
      }
    },
    synYearFire:{
      image:ee.Image('projects/mapbiomas-workspace/SEEG/2021/FIRE_DYNAMICS/internal-version-nasa-mcd64a1-year-since-fire-v1'),
      visParams:{
        min:1,
        max:options.year - 2001,
        palette:['a900ff', '6f02ff', '020aff', '0675ff', '06ffff', 'ffee00', 'ff7700', 'ff0800', 'c20202', '0aa602', '0cff00'],
        bands:'classification_' + options.year,
      }
    },
    period:{
      start:2001,
      end:2020
    }
  },
  fire_cci:{
    monthly:{
      image:ee.Image('projects/mapbiomas-workspace/FOGO1/monthly-coverage-firecci-v2')
        .divide(100)
        .int(),
      visParams:{
        min:1,
        max:12,
        palette:['a900ff', '6f02ff', '020aff', '0675ff', '06ffff', 'ffee00', 'ff7700', 'ff0800', 'c20202', '0aa602', '0cff00'],
        bands:'burned_coverage_' + options.year,
      }
    },
    'ano':{
      image:ee.Image('projects/mapbiomas-workspace/FOGO1/monthly-coverage-firecci-v2')
        .gte(1),
      visParams:{
        min:0,
        max:1,
        palette:['800000'],
        bands:'burned_coverage_' + options.year,
      }
    },
    burned_cover:{
      image:ee.Image('projects/mapbiomas-workspace/FOGO1/monthly-coverage-firecci-v2')
        .mod(100),
      visParams:{
        min:0,
        max:49,
        palette:require('users/mapbiomas/modules:Palettes.js').get('classification6'),
        bands:'burned_coverage_' + options.year,
      }
    },
    acumulated:{
      image:ee.Image('projects/mapbiomas-workspace/FOGO1/frequency-coverage-firecci-v2')
        .gte(1),
      visParams:{
        min:0,
        max:1,
        palette:['ff0000'],
        bands:'fire_frequency_2001_' + options.year,
      }
    },
    acumulated_cover:{
      image:ee.Image('projects/mapbiomas-workspace/FOGO1/frequency-coverage-firecci-v2')
        .mod(100),
     visParams:{
        min:0,
        max:49,
        palette:require('users/mapbiomas/modules:Palettes.js').get('classification6'),
        bands:'fire_frequency_2001_' + options.year,
      }
    },
    frequency:{
      image:ee.Image('projects/mapbiomas-workspace/FOGO1/frequency-coverage-firecci-v2')
        .divide(100)
        .int(),
      visParams:{
        min:1,
        max:36,
        palette:['ffffff','F8D71F','DAA118','BD6C12','9F360B','810004','4D0709'],
        bands:'fire_frequency_2001_' + options.year,
      }
    },
    synYearFire:{
      image:ee.Image('projects/mapbiomas-workspace/SEEG/2021/FIRE_DYNAMICS/internal-version-esa-firecci-year-since-fire-v1'),
      visParams:{
        min:1,
        max:options.year - 2001,
        palette:['a900ff', '6f02ff', '020aff', '0675ff', '06ffff', 'ffee00', 'ff7700', 'ff0800', 'c20202', '0aa602', '0cff00'],
        bands:'classification_' + options.year,
      }
    },
    period:{
      start:2001,
      end:2019
    }
  },
  firms:{
    monthly:{
      image:ee.Image('projects/mapbiomas-workspace/FOGO1/monthly-coverage-firms-v2')
        .divide(100)
        .int(),
      visParams:{
        min:1,
        max:12,
        palette:['a900ff', '6f02ff', '020aff', '0675ff', '06ffff', 'ffee00', 'ff7700', 'ff0800', 'c20202', '0aa602', '0cff00'],
        bands:'burned_coverage_' + options.year,
      }
    },
    'ano':{
      image:ee.Image('projects/mapbiomas-workspace/FOGO1/monthly-coverage-firms-v2')
        .gte(1),
      visParams:{
        min:0,
        max:1,
        palette:['800000'],
        bands:'burned_coverage_' + options.year,
      }
    },
    burned_cover:{
      image:ee.Image('projects/mapbiomas-workspace/FOGO1/monthly-coverage-firms-v2')
        .mod(100),
      visParams:{
        min:0,
        max:49,
        palette:require('users/mapbiomas/modules:Palettes.js').get('classification6'),
        bands:'burned_coverage_' + options.year,
      }
    },
    acumulated:{
      image:ee.Image('projects/mapbiomas-workspace/FOGO1/frequency-coverage-firms-v2')
        .gte(1),
      visParams:{
        min:0,
        max:1,
        palette:['ff0000'],
        bands:'fire_frequency_2001_' + options.year,
      }
    },
    acumulated_cover:{
      image:ee.Image('projects/mapbiomas-workspace/FOGO1/frequency-coverage-firms-v2')
        .mod(100),
     visParams:{
        min:0,
        max:49,
        palette:require('users/mapbiomas/modules:Palettes.js').get('classification6'),
        bands:'fire_frequency_2001_' + options.year,
      }
    },
    frequency:{
      image:ee.Image('projects/mapbiomas-workspace/FOGO1/frequency-coverage-firms-v2')
        .divide(100)
        .int(),
      visParams:{
        min:1,
        max:36,
        palette:['ffffff','F8D71F','DAA118','BD6C12','9F360B','810004','4D0709'],
        bands:'fire_frequency_2001_' + options.year,
      }
    },
    synYearFire:{
      image:ee.Image('projects/mapbiomas-workspace/SEEG/2021/FIRE_DYNAMICS/internal-version-nasa-firms-year-since-fire-v1'),
      visParams:{
        min:1,
        max:options.year - 2001,
        palette:['a900ff', '6f02ff', '020aff', '0675ff', '06ffff', 'ffee00', 'ff7700', 'ff0800', 'c20202', '0aa602', '0cff00'],
        bands:'classification_' + options.year,
      }
    },
    period:{
      start:2001,
      end:2020
    }
  },
//   'INPE focos de calor':{
//     monthly:{
//       image:ee.ImageCollection('projects/ee-wallacesilva/assets/ALL-FOCUS-OF-INPE-SULAMERICA')
//         .toBands()
//         .select([
//           'focos_2000_constant','focos_2001_constant','focos_2002_constant','focos_2003_constant','focos_2004_constant',
//           'focos_2005_constant','focos_2006_constant','focos_2007_constant','focos_2008_constant','focos_2009_constant',
//           'focos_2010_constant','focos_2011_constant','focos_2012_constant','focos_2013_constant','focos_2014_constant',
//           'focos_2015_constant','focos_2016_constant','focos_2017_constant','focos_2018_constant','focos_2019_constant',
//           'focos_2020_constant','focos_2021_constant'],
//           [
//           'focos_2000','focos_2001','focos_2002','focos_2003','focos_2004',
//           'focos_2005','focos_2006','focos_2007','focos_2008','focos_2009',
//           'focos_2010','focos_2011','focos_2012','focos_2013','focos_2014',
//           'focos_2015','focos_2016','focos_2017','focos_2018','focos_2019',
//           'focos_2020','focos_2021'
//         ]),
//         visParams:{
//         min:1,
//         max:12,
//         palette:['a900ff', '6f02ff', '020aff', '0675ff', '06ffff', 'ffee00', 'ff7700', 'ff0800', 'c20202', '0aa602', '0cff00'],
//         bands:'focos_' + options.year,
//       }
//     },
//     'ano':{
//       image:ee.ImageCollection('projects/ee-wallacesilva/assets/ALL-FOCUS-OF-INPE-SULAMERICA')
//         .toBands()
//         .select([
//           'focos_2000_constant','focos_2001_constant','focos_2002_constant','focos_2003_constant','focos_2004_constant',
//           'focos_2005_constant','focos_2006_constant','focos_2007_constant','focos_2008_constant','focos_2009_constant',
//           'focos_2010_constant','focos_2011_constant','focos_2012_constant','focos_2013_constant','focos_2014_constant',
//           'focos_2015_constant','focos_2016_constant','focos_2017_constant','focos_2018_constant','focos_2019_constant',
//           'focos_2020_constant','focos_2021_constant'],
//           [
//           'focos_2000','focos_2001','focos_2002','focos_2003','focos_2004',
//           'focos_2005','focos_2006','focos_2007','focos_2008','focos_2009',
//           'focos_2010','focos_2011','focos_2012','focos_2013','focos_2014',
//           'focos_2015','focos_2016','focos_2017','focos_2018','focos_2019',
//           'focos_2020','focos_2021'
//         ]),
//         visParams:{
//         min:0,
//         max:1,
//         palette:['cccccc'],
//         bands:'focos_' + options.year,
//       }
//     },
//     burned_cover:{
//       image:ee.Image('projects/mapbiomas-workspace/FOGO1/monthly-focos-inpe-mais')
//         .mod(100),
//       visParams:{
//         min:0,
//         max:49,
//         palette:require('users/mapbiomas/modules:Palettes.js').get('classification6'),
//         bands:'classification_' + options.year,
//       }
//     },
//     acumulated:{
//       image:ee.Image('projects/mapbiomas-workspace/FOGO1/frequency-coverage-inpe-v2')
//         .gte(1)
// ,
//       visParams:{
//         min:0,
//         max:1,
//         palette:['ff0000'],
//         bands:'fire_frequency_2000_' + options.year,
//       }
//     },
//     acumulated_cover:{
//       image:ee.Image('projects/mapbiomas-workspace/FOGO1/frequency-coverage-inpe-v2')
//         .mod(100)
// ,
//     visParams:{
//         min:0,
//         max:49,
//         palette:require('users/mapbiomas/modules:Palettes.js').get('classification6'),
//         bands:'fire_frequency_2000_' + options.year,
//       }
//     },
//     frequency:{
//       image:ee.Image('projects/mapbiomas-workspace/FOGO1/frequency-coverage-inpe-v2')
//         .divide(100)
//         .int(),
//       visParams:{
//         min:1,
//         max:36,
//         palette:['ffffff','F8D71F','DAA118','BD6C12','9F360B','810004','4D0709'],
//         bands:'fire_frequency_2000_' + options.year,
//       }
//     },
//     synYearFire:{
//       image:ee.Image(0),
//       visParams:{
//         min:1,
//         max:options.year - 2001,
//         palette:['a900ff', '6f02ff', '020aff', '0675ff', '06ffff', 'ffee00', 'ff7700', 'ff0800', 'c20202', '0aa602', '0cff00'],
//         bands:'classification_' + options.year,
//       }
//     },
//     period:{
//       start:2000,
//       end:2021
//     }
//   },
  'MapBiomas Fogo mensal s2 (v1)':{
    'ano':{
    image: ee.ImageCollection([
      [2019,2021,2022].map(function(year){
        
        var year_col =  ee.ImageCollection("users/geomapeamentoipam/Colecao_fogo_sentinel_mensal_v2")
          .filter(ee.Filter.eq('year',year))
        
        return year_col.mosaic().rename('fireYear_' + year);
      
    })
  ]).mosaic(),
     visParams:{
      min:1,
      max:1,
      palette:['de0000'],
      bands:'fireYear_' + options.year,
    },
    },
    monthly:{
    image: ee.ImageCollection([
      [2019,2021,2022].map(function(year){
        
        var year_col =  ee.ImageCollection("users/geomapeamentoipam/Colecao_fogo_sentinel_mensal_v2")
          .filter(ee.Filter.eq('year',year));
        
        var blend = ee.Image(0).mask(0);
        
        var first_up =  [12,11,10,9,8,7,6,5,4,3,2,1]; // a pílha fica organizada com as imagens dos primeiro meses por cima
        var last_up =  [1,2,3,4,5,6,7,8,9,10,11,12]; // a pilha fica organizada com as imagens dos ultimos meses por cima
          
        if (year === 2021){
          first_up = first_up.slice(2);
          last_up = last_up.slice(0,-2);
        }  
        
        first_up.forEach(function(month){
          
          var img = ee.Image(month)
            .updateMask(year_col
            .filter(ee.Filter.eq('fireMonth',month))
            .mosaic());
          
          blend = blend.blend(img);
        });
        
        return blend.rename('fireMonth_' + year);
      
    })
  ]).mosaic(),
     visParams:{
      min:1,
      max:12,
      palette:['a900ff', '6f02ff', '020aff', '0675ff', '06ffff', 'ffee00', 'ff7700', 'ff0800', 'c20202', '0aa602', '0cff00'],
      bands:'fireMonth_' + options.year,
    },
    },
    period:{
      start:2018,
      end:2023
    }
  },

  // --- coleções de cicatrizes, com bandas com informações paralelas
  MCD64A1:{
    collection:ee.ImageCollection("MODIS/006/MCD64A1")//2000-11-01T00:00:00 - 2021-08-01T00:00:00
      ,
    visParams:{
        min:0,
        max:1,
        bands:['BurnDate'],
        palette:['fc6000'],
      },
    period:{
      start:2000,
      end:2023
    },
  },
  'BUFFER-FOCUS':{
      collection:ee.ImageCollection('projects/workspace-ipam/assets/BUFFER-DOUBLE-MONTHLY-FOCUS-OF-INPE-SULAMERICA')
        .map(function(image){
          var year = ee.String(image.get('year')).slice(0,-2);
          var month = ee.String(image.get('month')).slice(0,-2);
          return image
            .set({
            'system:time_start':ee.Date(
              year.cat('-').cat(month).cat('-01')
              )
          });
        }),
      visParams:{
        min:1,
        max:1,
        palette:['000000'/*,'ffffff'*/],
        bands:['inpe-focus']
      },
    period:{
      start:2000,
      end:2023
    },
  
  },

  FIRMS:{
    collection:ee.ImageCollection("FIRMS")//2000-11-01T00:00:00 - 2021-10-23T00:00:00
      ,
    visParams:{
        min:0,
        max:1,
        bands:['T21'],
        palette:['823b15']
      },
    period:{
      start:2000,
      end:2023
    },
  },
  FIRE_CCI:{
    collection:ee.ImageCollection("ESA/CCI/FireCCI/5_1")//2001-01-01T00:00:00 - 2019-12-31T00:00:00
    ,
    visParams:{
        min:0,
        max:1,
        bands:['BurnDate'],
        palette:['baa506']
      },
    period:{
      start:2001,
      end:2019
    }
  },
  'MapBiomas Fogo Sentinel 2 (v1)':{
    collection:ee.ImageCollection("users/geomapeamentoipam/Colecao_fogo_sentinel_v1")//2017-01-01T00:00:00 - 2021-12-31T00:00:00
    ,
    visParams:{
        min:0,
        max:1,
        bands:['FireYear'],
        palette:['000000']
      },
    period:{
      start:2019,
      end:2023
    }
  },
  'MapBiomas Fogo Sentinel 2 (v2)':{
    collection:ee.ImageCollection("users/geomapeamentoipam/Colecao_fogo_sentinel_v2")//2017-01-01T00:00:00 - 2021-12-31T00:00:00
    ,
    visParams:{
        min:0,
        max:1,
        bands:['FireYear'],
        palette:['a856d1']
      },
    period:{
      start:2019,
      end:2023
    }
  },  
  'MapBiomas Fogo mensal Sentinel 2 (v2)':{
    collection:ee.ImageCollection("users/geomapeamentoipam/Colecao_fogo_sentinel_mensal_v2")
      .map(function (image){
        var year = image.get('year');
        var month = image.getNumber('fireMonth').int();
        
        var dic_days = ee.Dictionary({1:31,2:28,3:31,4:30,5:31,6:30,7:31,8:31,9:30,10:31,11:30,12:31});
        
        if (year === 2012 || year === 2016 || year === 2020){
          dic_days[2] = 29;
        }
        var end_day = dic_days.get(month);
          
        return image.set({
          'system:time_end':ee.Date.fromYMD(year, month, 1, 'America/Sao_Paulo'),
          'system:time_start':ee.Date.fromYMD(year, month, end_day, 'America/Sao_Paulo')
      });
  }),
    visParams:{
        min:0,
        max:1,
        bands:['FireMonth'],
        palette:['de0000']
      },
    period:{
      start:2019,
      end:2023
    }
  },

  // --- coleções de imagens de satelites 
  terra:{
    collection:ee.ImageCollection("MODIS/006/MOD09A1"),//2000-03-05T00:00:00 - 2021-10-16T00:00:00
    visParams:{
        min:300,
        max:4000,
        bands:['swir1','nir','red'],
      },
    period:{
      start:2000,
      end:2023
    },
  },
  aqua:{
    collection:ee.ImageCollection("MODIS/006/MYD09A1"),//2002-07-04T00:00:00 - 2021-10-16T00:00:00
    visParams:{
        min:300,
        max:4000,
        bands:['swir1','nir','red'],
      },
    period:{
      start:2002,
      end:2023
    },
  },
  landsat_4:{
    collection:ee.ImageCollection("LANDSAT/LT04/C01/T2_SR")
      .filter(ee.Filter.inList('system:index', options.blockList_landsat).not())
      .map(function (image){ return image.updateMask(ee.Image().paint(image.geometry().buffer(-3000)).eq(0))})
      .map(function (image) {
         var qa = image.select('pixel_qa');
         // If the cloud bit (5) is set and the cloud confidence (7) is high
         // or the cloud shadow bit is set (3), then it's a bad pixel.
         var cloud = qa.bitwiseAnd(1 << 5)
         .and(qa.bitwiseAnd(1 << 7))
         .or(qa.bitwiseAnd(1 << 3));
         // Remove edge pixels that don't occur in all bands
         var mask2 = image.mask().reduce(ee.Reducer.min());
         return image.updateMask(cloud.not()).updateMask(mask2);
      }),//1982-08-22T00:00:00 - 1993-12-14T00:00:00
    visParams:{
        min:300,
        max:4000,
        bands:['swir1','nir','red'],
      },
    period:{
      start:1982,
      end:1993
    },
  },
  landsat_5:{
    collection:ee.ImageCollection('LANDSAT/LT05/C01/T1_SR')
      .filter(ee.Filter.inList('system:index', options.blockList_landsat).not())
      .map(function (image){ return image.updateMask(ee.Image().paint(image.geometry().buffer(-3000)).eq(0))})
      .map(function (image) {
         var qa = image.select('pixel_qa');
         // If the cloud bit (5) is set and the cloud confidence (7) is high
         // or the cloud shadow bit is set (3), then it's a bad pixel.
         var cloud = qa.bitwiseAnd(1 << 5)
         .and(qa.bitwiseAnd(1 << 7))
         .or(qa.bitwiseAnd(1 << 3));
         // Remove edge pixels that don't occur in all bands
         var mask2 = image.mask().reduce(ee.Reducer.min());
         return image.updateMask(cloud.not()).updateMask(mask2);
      }),//1984-01-01T00:00:00 - 2012-05-05T00:00:00
    visParams:{
        min:300,
        max:4000,
        bands:['swir1','nir','red'],
      },
    period:{
      start:1984,
      end:2012
    },
  },
  landsat_7:{
    collection:ee.ImageCollection('LANDSAT/LE07/C01/T1_SR')
      .filter(ee.Filter.inList('system:index', options.blockList_landsat).not())
      .map(function (image){ return image.updateMask(ee.Image().paint(image.geometry().buffer(-3000)).eq(0))})
      .map(function (image) {
         var qa = image.select('pixel_qa');
         // If the cloud bit (5) is set and the cloud confidence (7) is high
         // or the cloud shadow bit is set (3), then it's a bad pixel.
         var cloud = qa.bitwiseAnd(1 << 5)
         .and(qa.bitwiseAnd(1 << 7))
         .or(qa.bitwiseAnd(1 << 3));
         // Remove edge pixels that don't occur in all bands
         var mask2 = image.mask().reduce(ee.Reducer.min());
         return image.updateMask(cloud.not()).updateMask(mask2);
      }), //1999-01-01T00:00:00 - 2021-01-24T00:00:00 // -> use until 2012 //Scanner broker failure on May 31, 2003, causing loss of 22% of the total image 
    visParams:{
      min:300,
      max:4000,
      bands:['swir1','nir','red'],
    },
    period:{
    start:1999,
    end:2023
  },
  },
  landsat_8:{
    collection:ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
      .filter(ee.Filter.inList('system:index', options.blockList_landsat).not())
      .map(function (image){ return image.updateMask(ee.Image().paint(image.geometry().buffer(-3000)).eq(0))})
      .map(function (image) {
         var qa = image.select('pixel_qa');
         // If the cloud bit (5) is set and the cloud confidence (7) is high
         // or the cloud shadow bit is set (3), then it's a bad pixel.
         var cloud = qa.bitwiseAnd(1 << 5)
         .and(qa.bitwiseAnd(1 << 7))
         .or(qa.bitwiseAnd(1 << 3));
         // Remove edge pixels that don't occur in all bands
         var mask2 = image.mask().reduce(ee.Reducer.min());
         return image.updateMask(cloud.not()).updateMask(mask2);
      }),//2013-04-11T00:00:00 - 2021-01-22T00:00:00
    visParams:{
        min:300,
        max:4000,
        bands:['swir1','nir','red'],
      },
    period:{
      start:2013,
      end:2023
    }
  },
  landsat_9:{
    collection:ee.ImageCollection('LANDSAT/LC09/C02/T1_L2') // -> atualizar para dados de superficie de reflectancia quando disponivel
      .filter(ee.Filter.inList('system:index', options.blockList_landsat).not())
      .map(function (image){ return image.updateMask(ee.Image().paint(image.geometry().buffer(-3000)).eq(0))})
      .map(function (image) {
         var qa = image.select('pixel_qa');
         // If the cloud bit (5) is set and the cloud confidence (7) is high
         // or the cloud shadow bit is set (3), then it's a bad pixel.
         var cloud = qa.bitwiseAnd(1 << 5)
         .and(qa.bitwiseAnd(1 << 7))
         .or(qa.bitwiseAnd(1 << 3));
         // Remove edge pixels that don't occur in all bands
         var mask2 = image.mask().reduce(ee.Reducer.min());
         return image.updateMask(cloud.not()).updateMask(mask2);
      }),//2013-04-11T00:00:00 - 2021-01-22T00:00:00
    visParams:{
        min:300,
        max:4000,
        bands:['swir1','nir','red'],
      },
    period:{
      start:2022,
      end:2023
    }
  },
  sentinel_2:{
    collection:ee.ImageCollection(
      ee.Join.saveFirst('cloud_mask').apply({
      primary: ee.ImageCollection("COPERNICUS/S2_SR"),
      secondary: ee.ImageCollection("COPERNICUS/S2_CLOUD_PROBABILITY"),
      condition:ee.Filter.equals({leftField: 'system:index', rightField: 'system:index'})
    })
    )
      .filter(ee.Filter.inList('system:index', options.blockList_sentinel).not())
      .map(function (image){
        // --- funtion maskEdge ref ->  https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S2_CLOUD_PROBABILITY 
        return image
          .updateMask(image.select('B8A').mask()
              .updateMask(image.select('B9').mask()));
        
      })
      .map(function (image){
        // --- funtion maskClouds ref ->  https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S2_CLOUD_PROBABILITY 
        var max_cloud_probability = 65;
        var clouds = ee.Image(image.get('cloud_mask')).select('probability');
        var isNotCloud = clouds.lt(max_cloud_probability);
        return image.updateMask(isNotCloud);
      }),//2017-03-28T00:00:00 - 2021-10-10T00:00:00
      visParams:{
        min:300,
        max:4000,
        bands:['swir1','nir','red'],
      },
    period:{
      start:2019,
      end:2023
    }
  },
  planet:{
    collection:ee.ImageCollection("projects/planet-nicfi/assets/basemaps/americas"),//2017-03-28T00:00:00 - 2021-10-10T00:00:00
    visParams:{
        min:100,
        max:800,
        bands:['red','green','blue'],
      },
    period:{
      start:2016,
      end:2023
    }
  },
  
  // - vector
  // --- --- auxiliar
  Paises:{
    feature:ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level0")
      .filter(ee.Filter.inList('ADM0_NAME',[
        'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guiana', 'French Guiana', 'Paraguay', 'Peru', 'Suriname', 'Uruguay', 'Venezuela',
      ]))
    ,
    id:'ADM0_CODE',
    propertie:'ADM0_NAME'
  },
  Biomas:{
    feature:ee.FeatureCollection('projects/mapbiomas-workspace/AUXILIAR/biomas_IBGE_250mil')
      .map(function(feature){
        return feature.set({'CD_Bioma':ee.Number.parse(feature.get('CD_Bioma'))});
      }),
    id:'CD_Bioma',
    propertie:'Bioma'
  },
  Regioes:{
    feature:ee.FeatureCollection('users/geomapeamentoipam/AUXILIAR/regioes_biomas')
      .map(function(feature){
        return feature.set({
          'name':ee.String(feature.get('bioma')).cat('_r').cat(feature.get('id'))
        });
      }),
    id:'region',
    propertie:'name'
  
  },
  Estados:{
    feature:ee.FeatureCollection('projects/mapbiomas-workspace/AUXILIAR/estados-2017')
      .map(function(feature){return feature.set('CD_GEOCUF',ee.Number.parse(feature.get('CD_GEOCUF')))}),
    id:'CD_GEOCUF',
    propertie:'NM_ESTADO'
  },
  Municipios:{
    feature:ee.FeatureCollection('projects/mapbiomas-workspace/AUXILIAR/municipios-2020'),
    id:'CD_MUN',
    propertie:'MUNICIPIO'

  },
  UC:{
    feature:ee.FeatureCollection('projects/mapbiomas-workspace/AUXILIAR/ucs-2019')
      .map(function(feature){return feature.set('ID',ee.Number.parse(feature.get('ID')))}),
    id:'ID',
    propertie:'DESCRICAO'
  },
  // Bacias_n1:ee.FeatureCollection(''),
  // Bacias_n2:ee.FeatureCollection(''),
  // Bacias_n3:ee.FeatureCollection(''),
  Landsat_tile:{
    feature:ee.FeatureCollection('projects/mapbiomas-workspace/AUXILIAR/cenas-landsat')
      .map(function(feature){return feature.set('TILE',ee.Number.parse(feature.get('TILE')))}),
    id:'TILE',
    propertie:'SPRNOME',
  },
  Quadriculas:{
    feature:ee.FeatureCollection('projects/nexgenmap/SAD_MapBiomas/DL/SHP_grades_BR_35pathces_AllBr')
      .map(function(feature){return feature.set({
        'indice': ee.Number.parse(feature.get('indice')),
        'indice_str': ee.String('').cat(feature.get('indice'))})}),
      id:'indice',
      propertie:'indice_str',
  },
  'Estudo de caso':{
    feature:ee.FeatureCollection("users/Merino/caiman_pol_certo")
      .map(function(feature){return feature.set({
        'tile':'Refugio Ecologico Caiman',
        'id':1
        });
      }),
    id:'id',
    propertie:'tile',
  },
  'Tela':{
    feature:ee.FeatureCollection("users/Merino/caiman_pol_certo")
      .map(function(feature){return feature.set({
        'tile':'Refugio Ecologico Caiman',
        'id':1
        });
      }),
    id:'id',
    propertie:'tile',
  }
};

// --- --- --- --- DICIONARIO COM ESTILOS DOS WIDGETS DA INTERFACE DE USUARIO
var styles = {
  comum_panel:{
    stretch:'both',
    margin:'0px 0px 0px 0px',
  },
  select_folder:{
    fontSize:'10px',
    stretch:'both',
    margin:'0px 0px 0px 0px',
    width:'150px',
  },
  options_panel:{
    stretch:'both',
    margin:'0px 0px 0px 0px',
    position:'top-right'
  },
  comum_label:{
    stretch:'both',
    margin:'2px 2px 2px 2px',
    fontSize:'12px',
    // backgroundColor:'cccccc'
  },
  clearLayers:{
    margin:'0px 0px 0px 0px',
    backgroundColor:'ffffff',
    position:'top-right'
  },
  thumbnailButton:{
    margin:'0px 0px 0px 0px',
    backgroundColor:'ffffff',
    position:'top-right',
    stretch:'horizontal',
  },
  check:{
    stretch:'both',
    fontSize:'12px',
    // width:'200px',
    margin:'1px 1px 1px 1px',
    height:'20px',
    backgroundColor:'dddddd'

  },
  check_month_filter:{
    stretch:'both',
    fontSize:'16px',
    // width:'200px',
    margin:'1px 1px 1px 1px',
    // height:'20px',
    // backgroundColor:'dddddd'
  },
  button_expSamples:{
    stretch:'both',
    // fontSize:'10px',
    // width:'150px',
    margin:'1px 1px 1px 1px',
    // height:'20px',
    // backgroundColor:'dddddd'

  },
  export_button:{
    fontSize:'10px',
    stretch:'both',
    margin:'0px 0px 0px 0px',
    // position:'top-right',
    width:'150px',
  },
  close_button:{
    // stretch:'both',
    fontSize:'12px',
    width:'50px',
    // height:'30px',
    margin:'1px 1px 1px 1px',
    color:'ff0000',
    backgroundColor:'ffffffff',
    // position:'top-left'
  },
  buttonThumbnail:{
    stretch:'vertical',
    fontSize:'10px',
    width:'50px',
    // height:'25px',
    margin:'1px 1px 1px 1px',
    // color:'ff0000',
    backgroundColor:'ffffffff',
    position:'top-right'
  },
  import_button:{
    // stretch:'horizontal',
    // width:'50px',
    // height:'30px',
    margin:'1px 1px 1px 1px',
    color:'000000',
    backgroundColor:'ffffffff',
    // position:'top-left'
  },
  comum_button:{
    fontSize:'14px',
    stretch:'both',
    margin:'1px 1px 1px 1px',
    // height:'30px',
    // width:'30px',
    // position:'bottom-left'
  },
  principal_panel:{
    position:'bottom-left',
    margin:'0px 0px 0px 0px',
  },
  logo:{
    // stretch:'both',
    margin:'0px 0px 0px 0px',
    // height:'50px',
    width:'350px'
  },
  logoMiniature:{
    // stretch:'both',
    margin:'0px 0px 0px 0px',
    // height:'50px',
    width:'200px',
    position:'bottom-left',
  },
  slider_year:{
    stretch:'horizontal',
    margin:'0px 0px 0px 0px',
  },
  software_name_label:{
    stretch:'both',
    margin:'2px 2px 2px 2px',
    fontSize:'12px',
    backgroundColor:'cccccc'
    
  },
  subtitle_simbol:{
    // stretch:'both',
    margin:'0px 0px 0px 0px',
    fontSize:'12px',
    // backgroundColor:'cccccc'
  },
  version_textbox:{
    stretch:'horizontal',
    margin:'1px 1px 1px 1px',
    width:'150px',
    fontSize:'10px'
  },
  textbox:{
    stretch:'horizontal',
    margin:'1px 1px 1px 1px',
    width:'300px',
  },
  link:{
    stretch:'horizontal',
    margin:'1px 1px 1px 1px',
    position:'top-left'
  },
  titleCheckbox:{
    margin:'0px 0px 0px 0px',
    fontSize:'12px',
    stretch:'horizontal',
  }
};

// ---- --- --- --- PADRONIZAÇÃO DE BANDAS NAS COLEÇÕES DE IMAGENS DE SATELITE
var bands = {
// landsat bands -> https://www.usgs.gov/faqs/what-are-best-landsat-spectral-bands-use-my-research?qt-news_science_products=0#qt-news_science_model
  landsat_4:{
    oldBands:["B1",  "B2",   "B3", "B4", "B5",   "B7",   "pixel_qa","B6"], // identicas ao do sensor landsat 5
    newBands:["blue","green","red","nir","swir1","swir2","pixel_qa","temp"]
  },
  landsat_5:{
    oldBands:["B1",  "B2",   "B3", "B4", "B5",   "B7",   "pixel_qa","B6"],
    newBands:["blue","green","red","nir","swir1","swir2","pixel_qa","temp"]
  },
  landsat_7: {
    oldBands:["B1",  "B2",   "B3", "B4", "B5",   "B7",   "pixel_qa","B6"],
    newBands:["blue","green","red","nir","swir1","swir2","pixel_qa","temp"]
  },
  landsat_8:{
    oldBands:["B1","B2",   "B3",   "B4", "B5", "B6",   "B7",   "pixel_qa","B6"],
    newBands:["uv","blue", "green","red","nir","swir1","swir2","pixel_qa","temp"]
  },
  landsat_9:{
    oldBands:["B1","B2",   "B3",   "B4", "B5", "B6",   "B7",   "pixel_qa","B6"],
    newBands:["uv","blue", "green","red","nir","swir1","swir2","pixel_qa","temp"]
  },
  sentinel_2:{ //S2_SR
    spectralInterval:[''],
    oldBands:['QA60', 'B1', 'B2',   'B3',    'B4',  'B5',  'B6',  'B7', 'B8'  ,  'B8A',  'B9',           'B11',   'B12',  'B12'],
    newBands:['QA60', 'cb', 'blue', 'green', 'red', 'red1','red2','red3','nir'  ,'nir2', 'waterVapor',   'swir1', 'swir2','cloudShadowMask']
  },
  terra:{
    spectralInterval:['620–670',     '841–876',     '459–479',     '545–565',     '1230–1250',   '1628–1652',   '2105–2155'],
    oldBands:        ['sur_refl_b01','sur_refl_b02','sur_refl_b03','sur_refl_b04','sur_refl_b05','sur_refl_b06','sur_refl_b07','QA','SolarZenith','ViewZenith','RelativeAzimuth','StateQA','DayOfYear'],
    newBands:        ['red',         'nir',         'blue',        'green',       'nir2',        'swir1',       'swir2',       'QA','SolarZenith','ViewZenith','RelativeAzimuth','StateQA','DayOfYear',]
  },
  aqua:{
    oldBands:['sur_refl_b01','sur_refl_b02','sur_refl_b03','sur_refl_b04','sur_refl_b05','sur_refl_b06','sur_refl_b07','QA','SolarZenith','ViewZenith','RelativeAzimuth','StateQA','DayOfYear'],
    newBands:['red','nir','blue','green','nir2','swir1','swir2','QA','SolarZenith','ViewZenith','RelativeAzimuth','StateQA','DayOfYear',]
  },
  planet:{
    oldBands:['B','G','R','N'],
    newBands:['blue','green','red','nir',]
  }
};

function setLayout (){
  
  options.mapp = ui.root.widgets().get(0);
  
  options.thumbs = ui.Panel({
    widgets:[0,1,2,3,4,5,6,7,8,9,10,11,12]
      .map(function(i){
        return ui.Panel({
          widgets:[/*ui.Label(''+ i)*/],
          layout:ui.Panel.Layout.flow('horizontal'),
          // style:styles.principal_panel
        });
      }),
    // layout:ui.Panel.Layout.flow('vertical'),
    // style:styles.principal_panel
  });
  options.head = ui.Panel({
    // widgets:[ui.Label('head')],
    layout:ui.Panel.Layout.flow('horizontal'),
    // style:styles.principal_panel
  });
  options.secondPanel = ui.Panel({
    widgets:[options.head/*,options.thumbs*/],
    layout:ui.Panel.Layout.flow('vertical'),
    // style:styles.principal_panel
  });
  
  options.splitPanel = ui.SplitPanel({
    firstPanel:options.mapp,
    secondPanel:options.secondPanel,
    orientation:'horizontal',
    // wipe:,
    style:{}
    });
  
  options.panel = ui.Panel({
    widgets:[],
    layout:ui.Panel.Layout.flow('vertical'),
    style:styles.principal_panel
  });
  
  options.mapp.add(options.panel)
  
  ui.root.widgets().reset([options.splitPanel]);
  
  // - alternative, insert panel in map
  // ui.root.widgets().reset([options.splitPanel]);
  // options.mapp.add(options.panel);
    
  var logomarca = ee.Image('projects/ee-wallacesilva/assets/logo-mapbiomasfogo-1_georeferenced');
   logomarca = logomarca.updateMask(logomarca.select(0).neq(0)) // comentar esta linha deixa a logo com fundo preto
    .visualize({});
  
  var logo = ui.Thumbnail({
    image:logomarca,
    params:{
      dimensions:1000,
    },
    // onClick:,
    style:styles.logo
  });
  
  var logoMiniature = ui.Thumbnail({
    image:logomarca,
    params:{
      dimensions:1000,
    },
    // onClick:,
    style:styles.logoMiniature
  });
  
logoMiniature.onClick(function(){
    options.mapp.remove(logoMiniature);
    options.mapp.add(options.panel);
    // options.mapp.remove(logoMiniature);
    // options.mapp.add(options.panel);
});

logo.onClick(function(){
    options.mapp.remove(options.panel);
    options.mapp.add(logoMiniature);
    // options.mapp.remove(options.panel);
    // options.mapp.add(logoMiniature);
});

  options.panel
    .add(logo);

    var clearLayers = ui.Button({
        label:'clean extra layers',
        onClick:function(){
          options.mapp.layers().map(function(layer){
            if (layer.getShown() === false){
              options.mapp.remove(layer)
              options[layer.getName()] = false
            return 
            }
            return layer;
          });
        },
        // layout;,
        style:styles.clearLayers});
    
    options.openThumbs = ui.Button({
        label:'Abrir thumbnails',
        // onClick:,
        // layout;,
        style:styles.thumbnailButton
    });

    options.textboxDimensions = ui.Textbox({
      // placeholder:'',
      value:options.dimensions,
      // onChange:,
      // disabled:,
      style:styles.thumbnailButton
    });
        
    options.layerOrCanvas = ui.Button({
        label:'Tela',
        // onClick:,
        // layout;,
        style:styles.thumbnailButton});
    
    options.mapp.add(clearLayers);
    options.head.add(options.openThumbs);
}

function exporting_samples (layer){
      
    var properties = {
          name:stringCorrect(layer['name']),
          sat:layer['name'].split('-')[0],
          region:layer['name'].split('-')[1],
          year:layer['name'].split('-')[2],
          version:options.sample_version,
          date_export:ee.Date(Date.now()).format('yyyy-MM-dd HH:mm:ss','America/Sao_Paulo'),
    };
  
    var sat = {
      'landsat_8':'l8',
      'landsat_5':'l5',
      'landsat_7':'l7',
      'sentinel_2':'sentinel'
    };
    
    sat = sat[properties['sat']];
    var description = stringCorrect('train_test_fire_nbr_' + properties['region'] + '_' + sat + '_' + properties['version'] + '_' + properties['year']);

    if (layer['name'].split('-').length === 4){
      properties = {
        name:stringCorrect(layer['name']),
        sat:layer['name'].split('-')[0],
        region:layer['name'].split('-')[1],
        year:layer['name'].split('-')[2],
        month:layer['name'].split('-')[3],
        version:options.sample_version,
        date_export:ee.Date(Date.now()).format('yyyy-MM-dd HH:mm:ss','America/Sao_Paulo'),
      }
    
    description = stringCorrect('train_test_fire_nbr_' + properties['region'] + '_' + sat + '_' + properties['version'] + '_' + properties['year'] + '_' + properties['month']);

    }
    
    var fogoGeometry = ee.Feature(fogo)
        .set(properties)
        .set('fire',1);

    // var naoFogo = ee.FeatureCollection(Map.drawingTools().layers().get(1).getEeObject())
    var naoFogoGeometry = ee.Feature(naoFogo)
        .set(properties)
        .set('fire',0);
    
    var featureCollection = ee.FeatureCollection([fogoGeometry,naoFogoGeometry])
        .set(properties);

    // print('featureCollection',featureCollection);
  
    var image_export = layer['eeObject']
        .divide(10000)
        .toFloat()
        .set(properties);
        
    //Criando image com amostras de cicatrizes
    var train_test_fire = image_export
      .addBands(ee.Image(1).toFloat().select(['constant'], ['landcover']))
      .clip(fogo);
        
    //Criando image com amostras de não cicatrizes                                    
    var train_test_not_fire = image_export
      .addBands(ee.Image(0).toFloat().select(['constant'], ['landcover']))
      .clip(naoFogo);
  
    // coleção amostras
    var train_test_image = ee.ImageCollection([
        train_test_fire,
        train_test_not_fire
      ]).mosaic();        
    
    var switch_folder = {
      landsat_8:'images_train_test_colecao1/' + stringCorrect(layer['name'].split('-')[1]),
      sentinel_2:'images_train_test_sentinel/' + stringCorrect(layer['name'].split('-')[1])
    };
    
    var folder = switch_folder[layer['name'].split('-')[0]];

    print(folder + '/' + description, 'properties', properties);
    // EXPORT TRAIN AND TEST
    Export.image.toCloudStorage({
      image: train_test_image.select(options.bands_export),
      description: 'samples_raster_toBucket_' + description,
      bucket: 'tensorflow-fire-cerrado1',
      fileNamePrefix: folder + '/' + description,
      maxPixels: 1e13,
      scale: 30,
      region: featureCollection.geometry().bounds()
    });

  print('ATENÇÃO! Exporte as amostras para o bucket' + description + 'na aba tasks');

  Export.table.toAsset({
        collection: featureCollection, 
        description: 'samples_vector_toAsset_' + description,
        assetId: options.folder_toAsset + description,
    });
    
  print('ATENÇÃO! Exporte as amostras para o asset' + description + 'na aba tasks');

      
}

function exporting_mosaic (layer){
      
      
    var properties = {
          name:stringCorrect(layer['name']),
          sat:layer['name'].split('-')[0],
          region:layer['name'].split('-')[1],
          year:layer['name'].split('-')[2],
          date_export:ee.Date(Date.now()).format('yyyy-MM-dd HH:mm:ss','America/Sao_Paulo'),
    };

    var description = stringCorrect(properties['region'] + '_' + properties['year']);


    if (layer['name'].split('-').length === 4){
      properties = {
        name:stringCorrect(layer['name']),
        sat:layer['name'].split('-')[0],
        region:layer['name'].split('-')[1],
        year:layer['name'].split('-')[2],
        month:layer['name'].split('-')[3],
        date_export:ee.Date(Date.now()).format('yyyy-MM-dd HH:mm:ss','America/Sao_Paulo'),
      }
      
      description =  stringCorrect(properties['region'] + '_' + properties['year'] + '_' + properties['month']);

    }
    
    var bands = ['red','nir','swir1','swir2'];
    
    var image_export =   layer['eeObject']
      .select(options.bands_export.slice(0,-1))
      .divide(10000)
      .toFloat()
      .set(properties)
      .updateMask(options['region-mask']);

   var switch_folder = {
      landsat_8:'mosaicos_to_classify_col1_bqahigh',
      sentinel_2:'mosaicos_to_classify_sentinel'
    };
    
    var folder = switch_folder[layer['name'].split('-')[0]];

    // EXPORT MOSAIC
    Export.image.toCloudStorage({
      image: image_export,
      description: 'mosaic_raster_toBucket_' + description,
      bucket: 'tensorflow-fire-cerrado1',
      fileNamePrefix: folder +  '/' + description,
      maxPixels: 1e13,
      scale: 30,
      region: options['region-bounds']
    });

  print('ATENÇÃO! Exporte mosaico para o bucket' + description + 'na aba tasks');
}

function stringCorrect(string) {
  return string
    .replace('-','_').replace(' ', '_')
      .replace('-','_').replace(' ', '_')
      .replace('-','_').replace(' ', '_')
      .replace('-','_').replace(' ', '_')
      .replace('-','_').replace(' ', '_')
      .replace('-','_').replace(' ', '_')
    .replace('â', 'a').replace('á', 'a')
      .replace('â', 'a').replace('á', 'a')
      .replace('â', 'a').replace('á', 'a')
      .replace('â', 'a').replace('á', 'a')
      .replace('â', 'a').replace('á', 'a')
    .replace('é', 'e')
      .replace('é', 'e')
      .replace('é', 'e')
      .replace('é', 'e')
      .replace('é', 'e')
    .replace('í', 'i')
      .replace('í', 'i')
      .replace('í', 'i')
      .replace('í', 'i')
      .replace('í', 'i')
    .replace('ô', 'o').replace('ó', 'o')
      .replace('ô', 'o').replace('ó', 'o')
      .replace('ô', 'o').replace('ó', 'o')
      .replace('ô', 'o').replace('ó', 'o')
      .replace('ô', 'o').replace('ó', 'o')
    .replace('ú', 'u')
      .replace('ú', 'u')
      .replace('ú', 'u')
      .replace('ú', 'u')
      .replace('ú', 'u')
    .toLowerCase();
}

function samples_export_button (layer) {
  return ui.Button({
    label:'Exp amostras',
    onClick:function(){
      
        print('ATENÇÃO: exportando amostras');
        
        var msg_importing;
        
        var label_textbox = ui.Label({
        value:'Controle de versão',
        style:styles.button_expSamples,
        // targetUrl:
      });
    
        var textbox_version = ui.Textbox({
            // placeholder:'Ex: v1',
            value:options.sample_version,
            onChange:function(value){
              options.sample_version = value;
          },
          // disabled, 
            style:styles.version_textbox,
          });
    
        var label_select = ui.Label({
          value:'Escolha a pasta do backup',
          style:styles.button_expSamples,
          // targetUrl:
        })
    
        var select = ui.Select({
          items:
          [
               { label:'AMOSTRAS_SENTINEL' , value:'projects/mapbiomas-workspace/FOGO/AMOSTRAS_SENTINEL/' },               
               { label:'AMOSTRAS_COLECAO1' , value:'projects/mapbiomas-workspace/FOGO/AMOSTRAS_COLECAO1/' },
               //{ label:'AVALIACOES_FOGO' , value:'projects/mapbiomas-workspace/FOGO/AVALIACOES_FOGO/' },
            
            ],
          // placeholder:'null',
          value:options.folder_toAsset,
          onChange:function(value){
            options.folder_toAsset = value
          },
          // disabled:,
          style:styles.select_folder
        });

        var buttom_export = ui.Button({
          label:'Exportar',
          onClick:function(){
            exporting_samples(layer);
          },
          // disabled:,
          style:styles.import_button
        });

        buttom_export.onClick(function(value){
          // functions_switch['export_avaliations']();
          options.mapp.remove(msg_importing);
        });
        
        var close_button = ui.Button({
              label:'X',
              onClick:function(){
                options.mapp.remove(msg_importing);
              },
              // disabled:,
              style:styles.close_button
            });
      
        var attention_msg = ui.Label({
              value:'ATENÇÃO: para exportar novas amostras, rodar o codigo novamente',
              style:styles.link,
              // targetUrl:'https://docs.google.com/spreadsheets/d/1niCqV-w7hXUtO2DXkDjyg5zKwK64ZvvLC1Hbn_lGsC4/edit#gid=403703259'
        });
        
        var null_label = ui.Label({
              value:' ',
              style:styles.link,
              // targetUrl:'https://docs.google.com/spreadsheets/d/1niCqV-w7hXUtO2DXkDjyg5zKwK64ZvvLC1Hbn_lGsC4/edit#gid=403703259'
        });
        
  
        var first_line = ui.Panel({
          widgets:[
            label_textbox,
            textbox_version
  
          ],
          layout:ui.Panel.Layout.flow('horizontal'),
          style:styles.comum_panel
        });

        var second_line = ui.Panel({
          widgets:[
            label_select,
            select,
          ],
          layout:ui.Panel.Layout.flow('horizontal'),
          style:styles.comum_panel
        });

        var third_line = ui.Panel({
          widgets:[
            buttom_export,
            null_label,
            close_button,
  
          ],
          layout:ui.Panel.Layout.flow('horizontal'),
          style:styles.comum_panel
        });


        msg_importing = ui.Panel({
          widgets:[
            first_line,
            second_line,
            attention_msg,
            third_line
          ],
          layout:ui.Panel.Layout.flow('vertical'),
          style:styles.msg_importing
        });
      
     

      options.mapp.add(msg_importing);
      
      // print({a:msg_importing.widgets().get(1)})
      // import_samples
      // app.functions.insertLayers();
      
    },
    // disabled:,
    style:styles.export_button,
    });
}

function subtitle_simbol (simbol,layer){
  var style = styles.subtitle_simbol;
  
  style['color'] = layer.visParams['palette'][0];
  
  return ui.Label({
    value:simbol,
    style:style,
    // targetUrl:
  });
}

function plotLayer (layer,obj,thumbnailCollection) {
  if (obj !== undefined){
    var post_widget = obj.post_widget || undefined; 
    var pre_widget = obj.pre_widget || undefined;
  }

  var properties = {
    name:stringCorrect(layer['name']),
    sat:layer['name'].split('-')[0],
    region:layer['name'].split('-')[1],
    year:layer['name'].split('-')[2],
  };
  
  var name = layer['name'];
  var check_name = properties['sat'] + '-' + properties['year'];

  
  if (options[name.split('-')[0]] === true){

    options.mapp.layers().filter(function(ly){
      return ly.getName().split('-')[0] === name.split('-')[0];
    }).forEach(function(ly){
      ly
        .setEeObject(layer['eeObject'])
        .setVisParams(layer['visParams'])
        .setName(layer['name']);
    });
    
    // options.mapp.add(ui.Map.Layer(layer));
    
    // if (thumbnailCollection !== undefined){
      plotThumbnail(true,thumbnailCollection);  
    // }
  }
  
   options.mapp.layers()
    .filter(function(ly){
      return ly.getEeObject().get('start') <= options.year;
    })
    .filter(function(ly){
      return ly.getEeObject().get('end') >= options.year;
    })
    .forEach(function(ly){
      options.mapp.remove(ly);
    });
  
  
  if (layer['name'].split('-').length === 4){
    properties = {
      name:stringCorrect(layer['name']),
      sat:layer['name'].split('-')[0],
      region:layer['name'].split('-')[1],
      year:layer['name'].split('-')[2],
      month:layer['name'].split('-')[3],
    }
    
    name = layer['name'];
    check_name = properties['sat'] + '-' + properties['year'] + '-' + properties['month'];

  }
  
  var ui_layer = ui.Map.Layer(layer);
  
  var check = ui.Checkbox({
    label:check_name,
    value:options[properties['sat']] || layer['shown'],
    onChange:function(value){

      options[properties['sat']] = value;

      if (value === true){
        
        options.mapp.layers().filter(function(layer){
          return layer.getName().split('-')[0] === properties['sat'];
        }).map(function(layer){
          return options.mapp.remove(layer);
        });
        
        ui_layer.setShown(true);
        options.mapp.add(ui_layer);
        
        plotThumbnail(true,thumbnailCollection)
      } 
      if (value === false){
        options.mapp.layers().filter(function(layer){
          return layer.getName().split('-')[0] === properties['sat'];
        }).map(function(layer){
          return options.mapp.remove(layer);
        });
        
        plotThumbnail(false,thumbnailCollection)
      }
    },
    // // disabled:,
    style:styles.check
  });
  
  var widgets = [check];

  if(post_widget !== undefined){
    widgets = widgets.concat([post_widget]);
  }

  if(pre_widget !== undefined){
    widgets = [pre_widget].concat(widgets);

  }
  
  var panel = ui.Panel({
    widgets:widgets,
    layout:ui.Panel.Layout.flow('horizontal'),
    style:styles.comum_panel
  });
  
  options.subtitle.add(panel);
  
}

function setSampleGeometry() {
  
  var buttons_panel = ui.Panel({
    widgets:[],
    layout:ui.Panel.Layout.flow('vertical'),
    style:styles.comum_panel
  })
  
  options.panel.add(buttons_panel);
  
  var functions_switch = {
    import_samples: function(){
        
        var fire = ee.FeatureCollection(options.folder_toAsset + options.address)
            .filter(ee.Filter.eq('fire',1))
            .geometry()
            .coordinates()
            .map(function(list){
              return ee.Geometry.Polygon(list)
            });
          
          fire.evaluate(function(geometriesList) {
            var layer = {
              geometries: geometriesList,
              name: 'fogo',
              color: 'ff0000',
              shown: true, // Show the layer (already defaults to true).
              // locked: true, // Lock the layer.
            };
            Map.drawingTools().addLayer(layer);
          });
          
          var notFire = ee.FeatureCollection(options.folder_toAsset + options.address)
            .filter(ee.Filter.eq('fire',0))
            .geometry()
            .coordinates()
            .map(function(list){
              return ee.Geometry.Polygon(list);
            });
          
          notFire.evaluate(function(geometriesList) {
            var layer = {
              geometries: geometriesList,
              name: 'naoFogo',
              color: '0000ff',
              shown: true, // Show the layer (already defaults to true).
              // locked: true, // Lock the layer.
            };
            Map.drawingTools().addLayer(layer);
          });

    
  },
    clear_sample:function () {
      // Add an empty layer to hold the drawn points.
      Map.drawingTools().layers().forEach(function(layer){

        if (layer.getName().slice(0,7) === 'naoFogo'){
          Map.drawingTools().layers().remove(layer)
        }

        if (layer.getName().slice(0,4) === 'fogo'){
          Map.drawingTools().layers().remove(layer)
        }
      });

    },
    import_avaliations: function() {
    
        var omission = ee.FeatureCollection(options.avaliations_address)
            .aside(print)
            .filter(ee.Filter.eq('data','omission'))
            .aside(print)
            .geometry()
            .coordinates()
            .map(function(list){
              return ee.Geometry.Point(list)
            }).aside(print)
;
          
          omission.evaluate(function(geometriesList) {
            var layer = {
              geometries: geometriesList,
              name: 'omissao',
              color: 'ff00ff',
              shown: true, // Show the layer (already defaults to true).
              // locked: true, // Lock the layer.
            };
            Map.drawingTools().addLayer(layer);
          });

        var comission = ee.FeatureCollection(options.avaliations_address)
            .filter(ee.Filter.eq('data','comission'))
            .geometry()
            .coordinates()
            .map(function(list){
              return ee.Geometry.Point(list)
            });
          
          comission.evaluate(function(geometriesList) {
            var layer = {
              geometries: geometriesList,
              name: 'comissao',
              color: 'ffff00',
              shown: true, // Show the layer (already defaults to true).
              // locked: true, // Lock the layer.
            };
            Map.drawingTools().addLayer(layer);
          });
// projects/mapbiomas-workspace/FOGO/AVALIACOES_FOGO/teste-v1
// projects/mapbiomas-workspace/FOGO/AVALIACOES_FOGO/teste-1    
  },
    clear_avaliations:function () {
      // Add an empty layer to hold the drawn points.
      Map.drawingTools().layers().forEach(function(layer){
         if (layer.getName().slice(0,3) === 'com'){
          Map.drawingTools().layers().remove(layer)
        }

        if (layer.getName().slice(0,3) === 'omi'){
          Map.drawingTools().layers().remove(layer)
        }
      });

    },
    export_avaliations:function () {
      var omission = ee.Feature(omissao)
        // .set(properties)
        .set('data','omission');

    // var naoFogo = ee.FeatureCollection(Map.drawingTools().layers().get(1).getEeObject())
    var comission = ee.Feature(comissao)
        // .set(properties)
        .set('data','comission');
    
    var featureCollection = ee.FeatureCollection([omission,comission])
    
    Export.table.toAsset({
      collection: featureCollection, 
      description: 'avaliations_vector_toAsset_' + options.avaliationsName,
      assetId: 'projects/mapbiomas-workspace/FOGO/AVALIACOES_FOGO/' + options.avaliationsName,
    });
    
     print('ATENÇÃO! Exporte as amostras para o asset' + options.avaliationsName + 'na aba tasks');
  
  }
  };
  
  var widget_switch = {
    
    importButton:ui.Button({
    label:'Resgatar amostras',
    onClick:function(){
      
      print('ATENÇÃO: importando amostras');
      
      var first_line = ui.Panel({
        widgets:[],
        layout:ui.Panel.Layout.flow('horizontal'),
        style:styles.comum_panel
      });
      var second_line = ui.Panel({
        widgets:[],
        layout:ui.Panel.Layout.flow('horizontal'),
        style:styles.comum_panel
      });
      
      var select = ui.Select({
          items:
          [
               { label:'AMOSTRAS_COLECAO1' , value:'projects/mapbiomas-workspace/FOGO/AMOSTRAS_COLECAO1/' },
               { label:'AMOSTRAS_SENTINEL' , value:'projects/mapbiomas-workspace/FOGO/AMOSTRAS_SENTINEL/' },
              // { label:'AVALIACOES_FOGO' , value:'projects/mapbiomas-workspace/FOGO/AVALIACOES_FOGO/' },
            
            ],
          // placeholder:'null',
          value:options.folder_toAsset,
          onChange:function(value){
            options.folder_toAsset = value
          },
          // disabled:,
          style:styles.select_folder
        });
      
      var textbox = ui.Textbox({
          placeholder:'insira um endereço de amostras de fogo',
          // value:,
          onChange:function(value){
            options.address = value;
          },
          // disabled:,
          style:styles.textbox
          });
      
      var import_button = ui.Button({
            label:'importar',
            // onClick:,
            // disabled:,
            style:styles.import_button
          });


      import_button.onClick(function(value){

      functions_switch['clear_sample']();
      functions_switch['clear_sample']();
      functions_switch['import_samples']();
        options.mapp.remove(msg_importing);
      });
      
      var close_button = ui.Button({
            label:'X',
            onClick:function(){
              options.mapp.remove(msg_importing);
            },
            // disabled:,
            style:styles.close_button
          });
    
      var link = ui.Label({
            value:'consulte os endereços',
            style:styles.link,
            targetUrl:'https://docs.google.com/spreadsheets/d/1niCqV-w7hXUtO2DXkDjyg5zKwK64ZvvLC1Hbn_lGsC4/edit#gid=757401350'
      })
      
      first_line
        .add(select)
        .add(textbox)
      
      second_line
        .add(import_button)
        .add(link)
        .add(close_button)
      
      var attention_msg = ui.Label({
        value:'ATENÇÃO: para exportar novas avaliações, rodar o codigo novamente',
        style:styles.link,
        // targetUrl:'https://docs.google.com/spreadsheets/d/1niCqV-w7hXUtO2DXkDjyg5zKwK64ZvvLC1Hbn_lGsC4/edit#gid=403703259'
      });

      
      var msg_importing = ui.Panel({
        widgets:[
          first_line,
          attention_msg,
          second_line,
        ],
        layout:ui.Panel.Layout.flow('vertical'),
        style:styles.comum_panel
      });
      
     

      options.mapp.add(msg_importing);
      
      // print({a:msg_importing.widgets().get(1)})
      // import_samples
      // app.functions.insertLayers();

      
    },
    // disabled:,
    style:styles.comum_button,
    }),
    clearGeometrysButton:ui.Button({
    label:'Limpar amostras',
    onClick:function(){
      functions_switch['clear_sample']();
      functions_switch['clear_sample']();
      
      Map.drawingTools().layers().add(ui.Map.GeometryLayer({
        geometries:null,
        name:'fogo',
        color:'ff0000',
        shown:true,
        // locked:
      }))
        
      Map.drawingTools().layers().add(ui.Map.GeometryLayer({
        geometries:null,
        name:'naoFogo',
        color:'0000ff',
        shown:true,
        // locked:
      }));
      
      print('limpar poligonos');
    },
    // disabled:,
    style:styles.comum_button,
  }),

    avaliationsImport:ui.Button({
      label:'Resgatar avaliações',
      onClick:function(){
        
        print('ATENÇÃO: importando avaliações');
        
            var textbox = ui.Textbox({
              placeholder:'insira um endereço das avaliações do dado de fogo',
              // value:,
              onChange:function(value){
              var asset = 'projects/mapbiomas-workspace/FOGO/AVALIACOES_FOGO/';
                options.avaliations_address = asset + value;
              },
              // disabled:,
              style:styles.textbox
            });

            var import_button = ui.Button({
              label:'importar',
              // onClick:,
              // disabled:,
              style:styles.import_button
            });
  
        import_button.onClick(function(value){
  
        functions_switch['clear_avaliations']();
        functions_switch['clear_avaliations']();
        functions_switch['import_avaliations']();
          options.mapp.remove(msg_importing);
        });
        
        var close_button = ui.Button({
              label:'X',
              onClick:function(){
                options.mapp.remove(msg_importing);
              },
              // disabled:,
              style:styles.close_button
            });
      
        var link = ui.Label({
              value:'consulte os endereços',
              style:styles.link,
              targetUrl:'https://docs.google.com/spreadsheets/d/1niCqV-w7hXUtO2DXkDjyg5zKwK64ZvvLC1Hbn_lGsC4/edit#gid=403703259'
        })
        
        var line = ui.Panel({
          widgets:[
            close_button,import_button,link
          ],
          layout:ui.Panel.Layout.flow('horizontal'),
          style:styles.comum_panel
        });

        var msg_importing = ui.Panel({
          widgets:[
            textbox,
            line
          ],
          layout:ui.Panel.Layout.flow('vertical'),
          style:styles.comum_panel
        });
        
       
  
        options.mapp.add(msg_importing);
        
      },
      // disabled:,
      style:styles.comum_button,
    }),
    avaliationsClear:ui.Button({
    label:'Limpar avaliações',
    onClick:function(){
        functions_switch['clear_avaliations']();
        functions_switch['clear_avaliations']();
      
      Map.drawingTools().layers().add(ui.Map.GeometryLayer({
        geometries:null,
        name:'omissao',
        color:'ff00ff',
        shown:true,
        // locked:
      }))
        
      Map.drawingTools().layers().add(ui.Map.GeometryLayer({
        geometries:null,
        name:'comissao',
        color:'ffff00',
        shown:true,
        // locked:
      }));
      
        print('limpar avaliaçãooes');
    },
    // disabled:,
    style:styles.comum_button,
  }),
    avaliationsExport:ui.Button({
      label:'Exportar avaliações',
      onClick:function(){
        
        print('ATENÇÃO: exportando avaliações');
        
            var textbox = ui.Textbox({
              placeholder:'insira o nome que deseja salvar esta avaliação ',
              // value:,
              onChange:function(value){
                options.avaliationsName = value;
              },
              // disabled:,
              style:styles.textbox
            });
            var buttom_export = ui.Button({
              label:'Exportar',
              // onClick:,
              // disabled:,
              style:styles.import_button
            });
  
        buttom_export.onClick(function(value){
        functions_switch['export_avaliations']();
          options.mapp.remove(msg_importing);
        });
        
        var close_button = ui.Button({
              label:'X',
              onClick:function(){
                options.mapp.remove(msg_importing);
              },
              // disabled:,
              style:styles.close_button
            });
      
        var link = ui.Label({
              value:'consulte os endereços',
              style:styles.link,
              targetUrl:'https://docs.google.com/spreadsheets/d/1niCqV-w7hXUtO2DXkDjyg5zKwK64ZvvLC1Hbn_lGsC4/edit#gid=403703259'
        });
        
        var line = ui.Panel({
          widgets:[
            close_button,
            buttom_export,
            link
          ],
          layout:ui.Panel.Layout.flow('horizontal'),
          style:styles.comum_panel
        });

        
        var msg_importing = ui.Panel({
          widgets:[
            textbox,
            line,
          ],
          layout:ui.Panel.Layout.flow('vertical'),
          style:styles.comum_panel
        });
        
       
  
        options.mapp.add(msg_importing);
        
        // print({a:msg_importing.widgets().get(1)})
        // import_samples
        // app.functions.insertLayers();
  
        
      },
      // disabled:,
      style:styles.comum_button,
    }),
    

  };
  
  var panelButton_1 = ui.Panel({
    widgets:[
      widget_switch['importButton'],
      widget_switch['clearGeometrysButton']
    ],
    layout:ui.Panel.Layout.flow('horizontal'),
    style:styles.comum_panel
  });

  var panelButton_2 = ui.Panel({
    widgets:[
      widget_switch['avaliationsImport'],
      widget_switch['avaliationsClear'],
      widget_switch['avaliationsExport']
    ],
    layout:ui.Panel.Layout.flow('horizontal'),
    style:styles.comum_panel
  });

  buttons_panel
  .add(panelButton_1)
  // .add(panelButton_2)
  
}

function setSelect(){
  var label = ui.Label({
    value:'Escolha a tabela depois a camada',
    style:styles.comum_label,
    // targetUrl:
    });
  
  options.list = dataset[options.region_table]['feature']
            .aggregate_array(dataset[options.region_table]['propertie'])
            .distinct()
            .sort()
            .getInfo()
        

  var sub_select; 

  options.vector = dataset[options.region_table]['feature']
    .filter(ee.Filter.eq(dataset[options.region_table]['propertie'],options.region));

  options['region-mask'] = ee.Image().paint(options.vector,dataset[options.region_table]['id']);
  options['region-line'] = ee.Image().paint(options.vector,'vazio',2.5);

  options['region-bounds'] = options.vector.geometry().bounds();

  // print(options['region-mask'],options['region-bounds'])
  
  var select = ui.Select({
    items:options.auxiliar, 
    // placeholder:,
    value:options.region_table,
    onChange:function(value){
        // print(value)
      options.region_table = value;
      
      if (value === 'Tela'){
        options.list = ['Tela'];
        
        dataset['Tela']['feature'] = ee.FeatureCollection(ee.Feature(ee.Geometry.Rectangle(options.mapp.getBounds()),{
          id:1,
          tile:'canvas',
        }));
      }

      
      // print(dataset[options.region_table],options.region_table,dataset[options.region_table]['feature']);

      options.list = dataset[options.region_table]['feature']
          .aggregate_array(dataset[options.region_table]['propertie'])
          .distinct()
          .sort()
          .getInfo();
          
      options.region = options.list[0];
      
      options.vector = dataset[options.region_table]['feature']
        .filter(ee.Filter.eq(dataset[options.region_table]['propertie'],options.region));
        
      options['region-mask'] = ee.Image().paint(options.vector,dataset[options.region_table]['id']);
      
      options['region-line'] = ee.Image().paint(options.vector,'vazio',2.5);
      
      options['region-bounds'] = options.vector.geometry().bounds();
      
      setSubtitle();
            
        options.select.remove(sub_select)
      
        sub_select = ui.Select({
            items:options.list,
            placeholder:'tabela',
            value:options[options.region_table] || options.list[0],
            onChange:function(sub_value){

              options.region = sub_value;

              options[options.region_table] = sub_value

              options.vector = dataset[options.region_table]['feature']
                .filter(ee.Filter.eq(dataset[options.region_table]['propertie'],options.region));
              options['region-mask'] = ee.Image().paint(options.vector,dataset[options.region_table]['id']);
              options['region-line'] = ee.Image().paint(options.vector,'vazio',2.5);
              options['region-bounds'] = options.vector.geometry().bounds();
              
              setSubtitle();
              
              options.mapp.centerObject(options.vector.geometry());
        
              options.layerOrCanvas.setLabel('Tela');
              //setThumbs();
  
         
            },
            // disabled:,
            style:styles.comum_button
          })

        
        options.select.insert(2,sub_select);
        options.mapp.centerObject(options.vector.geometry());
        
        
      options.layerOrCanvas.setLabel('Tela');
      //setThumbs();

      },
    // disabled:,
    style:styles.comum_button
  })
  
  sub_select = ui.Select({
          items:options.list,
          // placeholder:,
          value:options.region,
          onChange:function(sub_value){

            options.region = sub_value;
            
            options.vector = dataset[options.region_table]['feature']
              .filter(ee.Filter.eq(dataset[options.region_table]['propertie'],options.region));
            options['region-mask'] = ee.Image().paint(options.vector,dataset[options.region_table]['id']);
            options['region-line'] = ee.Image().paint(options.vector,'vazio',2.5);
            options['region-bounds'] = options.vector.geometry().bounds();
            
            setSubtitle();
            options.mapp.centerObject(options.vector.geometry());
            
            options.layerOrCanvas.setLabel('Tela');
            //setThumbs();
  
            // Map.addLayer(options['region-mask'])
            // Map.addLayer(options['region-bounds'])
            
          },
          // disabled:,
          style:styles.comum_button
        })

  
  options.select
    .add(label)
    .add(select)
    .add(sub_select);

}

function check_potential_fire_area (value){
            options.potential_area_fire = value;

            options.newThumbnails = true;
            setSubtitle();
            options.newThumbnails = false;
          }

function setSubtitle (){
  // --- programação orientado a listas
  
  // - limpa o painel para inserir novos valores em pilhas
  options.subtitle.clear();
  
  // - plote de dados de area queimada modelados em bandas
  function scar_image_plot (scar_image){
    function model_plot (model){
      
      if (scar_image === 'MapBiomas Fogo mensal s2 (v2)'){
          if (model === 'ano'){
           return
          }
        }
      
      var period = dataset[scar_image]['period'];
      if (options.year <= period['end']) {
        if (options.year >= period['start']) {
          // print ('Layer adicionada ' + scar_image + '-' + model + '-' + options.version + '-' + options.year);
        } else {
        // print ('não exite dados ' + scar_image + '-' + model + '-' + options.version + '-' + options.year);
         return ; 
        }
      }
      else {
        return ;
      }
      
      var eeObject = dataset[scar_image][model]['image'];
      var name = scar_image + '-' + model  +  '-' + options.region + '-' + options.year;
      var visParams = dataset[scar_image][model]['visParams'];

      var band = visParams['bands'].slice(0,-4);
      // print(visParams)

      visParams['bands'] = band + options.year;
      // print(visParams)
      var mask = dataset[scar_image]['monthly']['image']
        .updateMask(options['region-mask']);

      if (options.potential_area_fire === true){
        mask = mask.updateMask(dataset['BUFFER-FOCUS']['collection']
          .filter(ee.Filter.eq('year',options.year))
          .mosaic()
          .gte(1)
        )
      }

      
      // thumbnail 
      
      var thumbnailCollection = [
        {
          eeObject:eeObject.updateMask(mask.gte(1)),
          visParams:visParams,
          name:scar_image + '-' + model + '-' +  options.region + '-' + options.year,
        }
      ];
      
      [1,2,3,4,5,6,7,8,9,10,11,12]
        .forEach(function(month){
          var mask_temp = mask.eq(month);
          
          
        var thumbLayer = {
          eeObject:eeObject
            .updateMask(mask_temp)
            .set('month',month),
          visParams:visParams,
          name:scar_image + '-' + model + '-' +  options.region + '-' + options.year + '-' + month,
        }
          thumbnailCollection[month] = thumbLayer; 
        })
      
      // plotLayer       

      if (options.month_filter === true){
        
        name = scar_image + '-' + model + '-' +  options.region + '-' + options.year + '-' + options.month;
        
        mask = mask.eq(options.month);
        
        eeObject = eeObject.updateMask(mask) 
      }
      
      
      var post_widget = null;
      
      var layer = 
      // ui.Map.Layer( // manter como obj simples
        {
        eeObject:eeObject
          .updateMask(options['region-mask'])
          .set({
            start:period['start'],
            end:period['end'],
          }),
        visParams:visParams,
        name:name,
        shown:  options[name.split('-')[0]] || false,
        opacity:  dataset[name.split('-')[0]]['opacity'] || 1 
      };
      // );
      // print(layer['name'])
      
      plotLayer(layer,{
        // post_widget:post_widget,
        pre_widget:subtitle_simbol('▉',layer), //-> caracteres especiais ->https://economaster.com.br/textual-master/caracteres-especiais/
      },thumbnailCollection);
      

    }
  
    options.models.forEach(model_plot);
  }  

  // - plote de coleções de imagens de satelite de superficie de reflectancia
  function collection_sr_plot (col){
      
      // print(col,dataset[col])
      var period = dataset[col]['period'];
      if (options.year <= period['end']) {
        if (options.year >= period['start']) {
          // print ('Layer adicionada ' + col + options.year);
        } else {
        // print ('não exite dados ' + col + options.year);
         return 
  
        }
      } else {
        // print ('não exite dados ' + col + options.year);
         return 
      }

      var name =  col + '-' + options.region + '-' + options.year;
      var visParams = dataset[col]['visParams']
      
        
      var start = '' + options.year + '-01-01';
      var end = '' + (options.year + 1) + '-01-01';
      
      var regionMask = options['region-mask']
      
      if (options.potential_area_fire === true){
        regionMask = regionMask.updateMask(dataset['BUFFER-FOCUS']['collection']
          .filterDate(start,end)
          .mosaic());
      }
      
      
    // thumbnail 
      
      var thumbnailCollection = [
        {
          eeObject:dataset[col]['collection']
          .filterDate(start,end)
          .select(bands[col]['oldBands'],bands[col]['newBands'])
          .map(function(image){
            return image.normalizedDifference(['nir','swir1']) // https://www.usgs.gov/core-science-systems/nli/landsat/landsat-normalized-burn-ratio
              .multiply(-1)
              .rename('nbr')
              .addBands(image);
          }).qualityMosaic('nbr')
          .updateMask(regionMask),
          visParams:visParams,
          name:name,
        }
      ];
      
      
      
      [1,2,3,4,5,6,7,8,9,10,11,12]
        .forEach(function(month){
          var name_temp = col + '-' + options.region + '-' + options.year + '-' + month;
        
          var start_temp = '' + options.year + '-' + month + '-01';
          var end_temp = '' + options.year + '-' + (month + 1) + '-01';
          
          if (month === 12){
            end_temp = '' + (options.year + 1) + '-01-01';
          };
  
        var regionMask_temp = regionMask;

        if (options.potential_area_fire === true){
          regionMask_temp = regionMask.updateMask(dataset['BUFFER-FOCUS']['collection']
            .filterDate(start_temp,end_temp)
            .mosaic());
        }
        
        var thumbLayer = {
          eeObject:dataset[col]['collection']
          .filterDate(start_temp,end_temp)
          .select(bands[col]['oldBands'],bands[col]['newBands'])
          .map(function(image){
            return image.normalizedDifference(['nir','swir1']) // https://www.usgs.gov/core-science-systems/nli/landsat/landsat-normalized-burn-ratio
              .multiply(-1)
              .rename('nbr')
              .addBands(image);
          }).qualityMosaic('nbr')
          .updateMask(regionMask_temp),
          visParams:visParams,
          name: col + '-' + options.region + '-' + options.year + '-' + month,
        }
          thumbnailCollection[month] = thumbLayer; 
        })

      if (options.month_filter === true){
        name = col + '-' + options.region + '-' + options.year + '-' + options.month;
        
        start = '' + options.year + '-' + options.month + '-01';
        end = ee.String('' + options.year + '-').cat(ee.Number.parse(options.month).add(1)).cat('-01');
        
        if (options.month === '12'){
          end = '' + (options.year + 1) + '-01-01';
        }
      }
      
      if (options.potential_area_fire === true){
          regionMask = regionMask.updateMask(dataset['BUFFER-FOCUS']['collection']
            .filterDate(start,end)
            .mosaic());
      }

      
      var eeObject = dataset[col]['collection']
        .filterDate(start,end)
        .select(bands[col]['oldBands'],bands[col]['newBands'])
        .map(function(image){
          return image.normalizedDifference(['nir','swir1']) // https://www.usgs.gov/core-science-systems/nli/landsat/landsat-normalized-burn-ratio
            .multiply(-1)
            .rename('nbr')
            .addBands(image);
        }).qualityMosaic('nbr');
      
 
      
      var layer = 
      // ui.Map.Layer( // manter como omples
        {
        eeObject:eeObject
          .updateMask(regionMask)
          .set({
            start:period['start'],
            end:period['end'],
          }),
        visParams:visParams,
        name:name,
        shown:  options[col] || false,
        opacity: dataset[col]['opacity'] || 1
      };
      // );
      // print(layer['name'])
    
      
    if (col === 'planet') {
        eeObject = dataset[col]['collection']
          .filterDate(start,end)
          .select(bands[col]['oldBands'],bands[col]['newBands'])
          .map(function(image){
            return image.normalizedDifference(['nir','red']) // https://www.usgs.gov/core-science-systems/nli/landsat/landsat-normalized-difference-vegetation-index?qt-science_support_page_related_con=0#qt-science_support_page_related_con
              .multiply(-1)
              .rename('ndvi')
              .addBands(image);
          }).qualityMosaic('ndvi');
          
      var layer = {
        eeObject:eeObject
          .updateMask(regionMask)
          .set({
            start:period['start'],
            end:period['end'],
          }),
        visParams:visParams,
        name:name,
        shown:  options[col] || false,
        opacity: dataset[col]['opacity'] || 1
      };
      
      plotLayer(layer);
      return ;
      }


      
      plotLayer(layer,{
        post_widget:samples_export_button(layer),
        // pre_widget:buttons,
      },thumbnailCollection);
    }
  
  // - plote de coleções de dados de produtos de area queimada 
  function collection_scar_plot  (col){
      
      // print(col,dataset[col])
      var period = dataset[col]['period'];
      if (options.year <= period['end']) {
        if (options.year >= period['start']) {
          // print ('Layer adicionada ' + scar_image + '-' + model + '-' + options.year);
        } else {
        // print ('não exite dados ' + scar_image + '-' + model + '-' + options.year);
         return ;
  
        }
      }else {
         return ;
      }
      
      var eeObject = dataset[col]['collection'];
      var name =  col + '-' + options.region + '-' + options.year;
      var visParams = dataset[col]['visParams']
      
        
      var start = '' + options.year + '-01-01';
      var end = '' + (options.year + 1) + '-01-01';
      
      var regionMask = options['region-mask']
      if (options.potential_area_fire === true){
          regionMask = dataset['BUFFER-FOCUS']['collection']
            .filterDate(start,end)
            .mosaic()
            .updateMask(regionMask);
      }

      
      // thumbnail 
      
      var thumbnailCollection = [
        {
          eeObject:dataset[col]['collection']
          .filterDate(start,end)
          .mosaic()
          .updateMask(regionMask),
          visParams:visParams,
          name:name,
        }
      ];
      
      
      
      [1,2,3,4,5,6,7,8,9,10,11,12]
        .forEach(function(month){
          var name_temp = col + '-' + options.region + '-' + options.year + '-' + month;
        
          var start_temp = '' + options.year + '-' + month + '-01';
          var end_temp = '' + options.year + '-' + (month + 1) + '-01';
          
          if (month === 12){
            end_temp = '' + (options.year + 1) + '-01-01';
          };
          
        var regionMask_temp = regionMask;

        if (options.potential_area_fire === true){
          regionMask_temp = regionMask.updateMask(dataset['BUFFER-FOCUS']['collection']
            .filterDate(start_temp,end_temp)
            .mosaic());
        }

          
        var thumbLayer = {
          eeObject:dataset[col]['collection']
          .filterDate(start_temp,end_temp)
          .mosaic()
          .updateMask(regionMask_temp),
          visParams:visParams,
          name: col + '-' + options.region + '-' + options.year + '-' + month,
        }
          thumbnailCollection[month] = thumbLayer; 
        })
      

      if (options.month_filter === true){
        name = col + '-' + options.region + '-' + options.year + '-' + options.month;
        
        start = '' + options.year + '-' + options.month + '-01';
        end = ee.String('' + options.year + '-').cat(ee.Number.parse(options.month).add(1)).cat('-01')

        if (options.month === '12'){
          end = '' + (options.year + 1) + '-01-01';
        }
      }
      
      if (options.potential_area_fire === true){
          regionMask = dataset['BUFFER-FOCUS']['collection']
            .filterDate(start,end)
            .mosaic()
            .updateMask(regionMask);
      }

            
      eeObject = dataset[col]['collection']
        .filterDate(start,end)
        .mosaic();

      var post_widget = ui.Label('')
      if (col === 'BUFFER-FOCUS'){
      
        post_widget = ui.Checkbox({
          label:'filtro',
          value:options.potential_area_fire,
          onChange:check_potential_fire_area,
          // disabled:,
          // style:st
        })
      }

      var layer ={
        eeObject:eeObject
          .updateMask(regionMask)
          .set({
            start:period['start'],
            end:period['end'],
          }),
        visParams:visParams,
        name:name,
        shown: options[col] || false, 
        opacity:dataset[col]['opacity'] || 1,
      };

      if (post_widget.getValue() === true){

        options.mapp.layers().filter(function(layer){
          return layer.getName() === name;
        })
        .map(function(layer){
          return options.mapp.remove(layer);
        });
        
        // options.mapp.add(ui.Map.Layer(layer));
        plotLayer(layer);
        // setThumbs(name) -> automatização das thumbnails -> adicionar ou remo

      } 
      
      
      
      plotLayer(layer,{
        post_widget:post_widget,
        pre_widget:subtitle_simbol('▉',layer), //-> caracteres especiais ->https://economaster.com.br/textual-master/caracteres-especiais/
      },thumbnailCollection);
    }
  
  // - plote das camadas de localização
  function region_vis_plot (line){
  
  var switch_lines = {
    'line':{
      image:ee.Image().paint({
        featureCollection:options.vector,
        color:dataset[options.region_table]['id'], 
        width:1
      }),
      name:'Limite-' + line + '-'  + options.region,
      visParams:{palette:['000000']},
    },
    'lines':{
      image:ee.Image().paint({
        featureCollection:dataset[options.region_table]['feature'],
        color:dataset[options.region_table]['id'], 
        width:0.25
      }),
      name:'Limites-' + line + '-' + options.region_table,
      visParams:{palette:['808080']},
    },
    'Quadriculas':{
      image:ee.Image().paint({
        featureCollection:dataset['Quadriculas']['feature'].filterBounds(options.vector),
        color:dataset['Quadriculas']['id'], 
        width:0.25
      }),
      name:'Quadriculas-' + line + '-'  + options.region,
      visParams:{palette:['000000']},
    },
    'square':{
      image:ee.Image().paint({
        featureCollection:options['region-bounds'],
        color:dataset[options.region_table]['id'], 
        width:0.25
      }),
      name:'Quadro-' + line + '-'  + options.region,
      visParams:{palette:['000000']},
    }
  };
  
  var eeObject = switch_lines[line]['image'];
  
  var name = switch_lines[line]['name'];

  var visParams = switch_lines[line]['visParams'];  
  var layer = {
    eeObject:eeObject,
    visParams:visParams,
    name:name,
    shown: options[name.split('-')[0]] || false,
    opacity:  1
  };

     plotLayer(layer,{
        // post_widget:,
        pre_widget:subtitle_simbol('⊟',layer), //-> caracteres especiais ->https://economaster.com.br/textual-master/caracteres-especiais/
      });
  }
  
  
  // - plote de coleções de dados de produtos de area queimada 
  function collection_hotspots  (){
      
      // print(col,dataset[col])
      var period = {
        end:2022,
        start:2000
      };
      if (options.year <= period['end']) {
        if (options.year >= period['start']) {
          // print ('Layer adicionada ' + scar_image + '-' + model + '-' + options.year);
        } else {
        // print ('não exite dados ' + scar_image + '-' + model + '-' + options.year);
         return ;
  
        }
      }else {
         return ;
      }
      
      var name =  'Focos de calor' + '-' + options.region + '-' + options.year;
      var visParams = {}
      
      var eeObject = ee.FeatureCollection('users/geomapeamentoipam/VECTOR-ALL-FOCUS-OF-INPE-V1/focos_' + options.year);
  
      
      if (options.year === 2022){
        eeObject = ee.FeatureCollection('projects/workspace-ipam/assets/MONTHLY-FOCUS-OF-INPE-SULAMERICA/inpe-focus-2022-1')
        
        print('options.year === 2022',eeObject)
      }
      
      if (options.month_filter === true){
        print('options.month_filter === true');


        var eeObject_month = eeObject
          .filter(ee.Filter.eq('month',''+options.month));
        
        print('eeObject',eeObject.limit(2));
        
        var preMonth = options.month_int - 1;
        
        if(preMonth < 10){
          preMonth = '0' + preMonth;
        }
        
        var eeObject_preMonth = eeObject
          .filter(ee.Filter.eq('month',''+preMonth));
        
        print('eeObject_preMonth',eeObject_preMonth.limit(2),preMonth);
        
        if(options.month_int === 1){
          eeObject_preMonth = ee.FeatureCollection('users/geomapeamentoipam/VECTOR-ALL-FOCUS-OF-INPE-V1/focos_' + (options.year - 1))
          
          print('eeObject_preMonth',eeObject_preMonth.limit(2))
          eeObject_preMonth = eeObject_preMonth.filter(ee.Filter.eq('month','12'));

          print('eeObject_preMonth',eeObject_preMonth.limit(2))

          if(options.year === 2000){
            eeObject_preMonth = ee.FeatureCollection([]);
            
            print('options.year === 2000, eeObject_preMonth',eeObject_preMonth.limit(2));
            
          }

        }
        
        eeObject = eeObject_month
          .merge(eeObject_preMonth);

      }
        
      eeObject = eeObject
        .filterBounds(options.vector.geometry());

      var post_widget = ui.Label('')

      var layer ={
        eeObject:eeObject
          .set({
            start:period['start'],
            end:period['end'],
          }),
        visParams:{},
        name:name,
        // shown: options[col] || false, 
        // opacity:dataset[col]['opacity'] || 1,
      };
      
      plotLayer(layer,{
        // post_widget:post_widget,
        // pre_widget:subtitle_simbol('▉',layer), //-> caracteres especiais ->https://economaster.com.br/textual-master/caracteres-especiais/
      });
    }
  
  // --- Executando os plotes em função das listas organizadas
  options.region_vis.forEach(region_vis_plot);
  
  options.scar_images.forEach(scar_image_plot);
  
  options.collection_scar.forEach(collection_scar_plot);

  options.hotspot.forEach(collection_scar_plot);

  collection_hotspots();

  options.collection_sr.forEach(collection_sr_plot);
  
}

function plotThumbnail (boolean,collectionThumbnail){
    
    
    if (options.openThumbs.getLabel() === 'Abrir thumbnails'){
      return 
    };
    
    if (collectionThumbnail === undefined){
      return 
    };
    
    var geom;

    if ( options.layerOrCanvas.getLabel() !== 'Camada'){
      geom = options.vector.geometry().bounds()
    } else {
      geom = ee.Geometry.Rectangle(options.mapp.getBounds())
    }
    
    var widgets_list = options.thumbs.widgets();
    
    if (options.newThumbnails === true){
        options['panelThumbnail'+collectionThumbnail[0]['name']].forEach(function(thumb){
        widgets_list
          .get(options['panelThumbnail'+collectionThumbnail[0]['name']].indexOf(thumb))
          .remove(thumb)
    });
  
      options['panelThumbnail'+collectionThumbnail[0]['name']] = undefined;
    };
    
    
    if (options['panelThumbnail'+collectionThumbnail[0]['name']] === undefined){
      
      options['panelThumbnail'+collectionThumbnail[0]['name']] = collectionThumbnail.map( function (thumbnail){
    
            var layer_obj = {
              eeObject:thumbnail['eeObject'],
              visParams:thumbnail['visParams'],
              name:thumbnail['name'],
              shown:true,
              opacity:0.9
            };
            
            // print(layer_obj)
            var layer = ui.Map.Layer(layer_obj);
            
            var title  = ui.Checkbox({
              label:layer_obj['name'],
              value:options['thumbnail-'+layer_obj['name']] || false,
              onChange:function(value){
                
                if (value === true){
                  options['thumbnail-'+layer_obj['name']] = true
                  options.mapp.add(layer);
    
                } else {
                  options['thumbnail-'+layer_obj['name']] = false
                  options.mapp.remove(layer);
                }
              },
              style:styles.titleCheckbox
            });
           
            var reload = ui.Button({
              label:'↻',
              onClick:function(){
                print('↻')
              },
              // disabled:,
              style:styles.buttonThumbnail,
              // imageUrl:
            });
            
            var geotiff = ui.Button({
              label:'export',
              onClick:function(){
                exporting_mosaic(layer_obj);
              },
              // disabled:,
              style:styles.buttonThumbnail,
              // imageUrl:
            });
           
            var options_panel = ui.Panel({
              widgets:[
                title,
                reload,
                geotiff,
              ],
              layout:ui.Panel.Layout.flow('horizontal'),
              style:styles.options_panel
            })
            
            var thumbnail = ui.Thumbnail({
              image:layer_obj['eeObject']
                  .visualize(layer_obj['visParams'])
                  .blend(options['region-line'].visualize({palette:'000000'})),
                params:{
                  dimensions:options.dimensions,
                  region:geom,
                },
                onClick:function(){
                  print(layer_obj['name'])
    
                },
                style:{
                  backgroundColor:'fffbfb'
                }
              });
            
            var panel_thumbs = ui.Panel({
              widgets:[
                options_panel,
                thumbnail,
    
              ],
              layout:ui.Panel.Layout.flow('vertical'), 
                // style:,
              })
            

            reload.onClick(function(){
              panel_thumbs.remove(thumbnail);
              
              thumbnail = ui.Thumbnail({
                image:layer_obj['eeObject']
                  .visualize(layer_obj['visParams'])
                  .blend(options['region-line'].visualize({palette:'000000'})),
                  params:{
                    dimensions:options.dimensions,
                    region:geom,
                  },
                  // onClick:,
                  style:{
                    backgroundColor:'fffbfb'
                  }
              });
              
              panel_thumbs.insert(1,thumbnail);
              
            });
            
            return panel_thumbs;
        
      });
    
    }
    
    
    var ploted_thumbs = widgets_list.get(0).widgets();
    
    ploted_thumbs.forEach(function(ploted_thumb){
      
      // print(collectionThumbnail[0]['name'].split('-')[0], ploted_thumb.widgets().get(0).widgets().get(0).getLabel().split('-')[0], collectionThumbnail[0]['name'].split('-')[0] === ploted_thumb.widgets().get(0).widgets().get(0).getLabel().split('-')[0])
      if(collectionThumbnail[0]['name'].split('-')[0] === ploted_thumb.widgets().get(0).widgets().get(0).getLabel().split('-')[0]){
        options['panelThumbnail'+ ploted_thumb.widgets().get(0).widgets().get(0).getLabel()].forEach(function(thumb){
        widgets_list
          .get(options['panelThumbnail'+ploted_thumb.widgets().get(0).widgets().get(0).getLabel()].indexOf(thumb))
          .remove(thumb)
        })
      };
    });
    
    if (boolean === true){
      
      options['panelThumbnail'+collectionThumbnail[0]['name']].forEach(function(thumb){
        widgets_list
          .get(options['panelThumbnail'+collectionThumbnail[0]['name']].indexOf(thumb))
          .add(thumb)
      });

    };
  //   if (boolean === false){
  //     options['panelThumbnail'+collectionThumbnail[0]['name']].forEach(function(thumb){
  //       widgets_list
  //         .get(options['panelThumbnail'+collectionThumbnail[0]['name']].indexOf(thumb))
  //         .remove(thumb)
  //   });
  // }
}
  
function onClickThumbs (){
    
    if (options.openThumbs.getLabel() === 'Fechar thumbnails'){
      options.openThumbs.setLabel('Abrir thumbnails');
      options.secondPanel.remove(options.thumbs);
      options.head.remove(options.layerOrCanvas);
      options.head.remove(options.textboxDimensions);

      
      return ;
    } else {
      options.openThumbs.setLabel('Fechar thumbnails');

      // options.thumbs.add(ui.Label('Monthly images'));
      
      options.head.insert(1,options.textboxDimensions);
      options.head.insert(1,options.layerOrCanvas);
      
      options.secondPanel.add(options.thumbs);
      
      setSubtitle();
      return ;
    }
  }
  
function onChangeoTextboxDimensions (value){
    
    if (value === options.dimensions){
      return ;
    }
    
    options.dimensions = value
    
    
    options.newThumbnails = true;
    setSubtitle();
    options.newThumbnails = false;

  }

function onClickLayerOrCanvas (){
    
    if (options.layerOrCanvas.getLabel() === 'Camada'){
      options.layerOrCanvas.setLabel('Tela');
     
      options.newThumbnails = true;
      setSubtitle();
      options.newThumbnails = false;

      return ;
    } else {
      options.layerOrCanvas.setLabel('Camada');

      // options.thumbs.add(ui.Label('Monthly images'));
      
      options.newThumbnails = true;
      setSubtitle();
      options.newThumbnails = false;
      
      return ;
    }
  }

function setWidgets(){
  
  
  var slider = ui.Slider({
    min:1984,
    max:2022,
    value:options.year,
    step:1,
    onChange:function(value){
      // print(value);
      options.year = value;
      setSubtitle();
      
      options.layerOrCanvas.setLabel('Tela');
      //setThumbs();

    },
    // direction:,
    // disabled:,
    style:styles.slider_year
  });
  
  options.subtitle =  ui.Panel({
    widgets:[ui.Label('subtitle')],
    layout:ui.Panel.Layout.flow('vertical'),
    style:styles.comum_panel
  });

  options.select =  ui.Panel({
    widgets:[],
    layout:ui.Panel.Layout.flow('horizontal'),
    style:styles.comum_panel
  });
  options.subtitle_cache =  ui.Panel({
    widgets:[],
    layout:ui.Panel.Layout.flow('vertical'),
    style:styles.comum_panel
  });
  
  var slider_month = ui.Slider({
    min:1,
    max:12,
    value:ee.Number.parse(options.month),
    step:1,
    onChange:function(value){
      // print(value);
        options.month = '' + value;
        options.month_int =  value;
      
      if (value < 10){
        options.month = '0' + value;
      }
      
      if (options.month_filter === true){
        setSubtitle();
      }
    },
    // direction:,
    disabled:options.month_filter,
    style:styles.slider_year
  });
  
  var check = ui.Checkbox({
    label:'Filtro mensal',
    value:  options.month_filter || false,
    onChange:function(value){
      options.month_filter = value;
      setSubtitle();
    },
    // disabled:,
    style:styles.check_month_filter
  });
  
  var panel_month = ui.Panel({
    widgets:[check, slider_month],
    layout:ui.Panel.Layout.flow('horizontal'),
    style:styles.comum_panel
  });
  
  options.panel
    .add(options.select)
    .add(slider)
    .add(panel_month)
    .add(options.subtitle)
    .add(options.subtitle_cache);
  
}

function start (){
  print(ee.Date(Date.now()),options,dataset);

  setLayout();

  setWidgets();

  setSelect();

  setSampleGeometry();

  // options.mapp.centerObject(options.vector.geometry());

  setSubtitle();

  options.openThumbs.onClick(onClickThumbs);

  options.textboxDimensions.onChange(onChangeoTextboxDimensions);

  options.layerOrCanvas.onClick(onClickLayerOrCanvas);

  
  print(ee.Date(Date.now()),options,dataset);
}

start();

options.mapp.setCenter(-60.7664,-18.2121,6);

