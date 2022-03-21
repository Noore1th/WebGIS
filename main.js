window.onload = init;

function init(){
    const map = new ol.Map({
        //view是一个必须的参数
        view: new ol.View({
            center: [13469619.436750818, 2809817.519951009],
            zoom: 7,
            maxZoom:10,
            minZoom:4,
            rotation:0.5,
        }),

        //layers是可选参数
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM(),
                visible:false,//测试其他外部图层时暂时隐藏
            }),          
        ],


        target:'js-map'
    })

    //从外部引入图层(用于创建图层集baseLayerGroup)
    const openStreetMapStandard = new ol.layer.Tile({
        source: new ol.source.OSM(),
        visible: true,
        title: 'OSMStandard'
    })

    const openStreetMapHumanitarian = new ol.layer.Tile({
        source: new ol.source.OSM({
            url:'https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png'
        }),
        visible:false,
        title: 'OSMHumanitarian'
    })

    const stamenTerrain = new ol.layer.Tile({
        source: new ol.source.XYZ({
            url:'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg',
            //指明地图的归属
            attributions:'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
        }),
        visible:false,
        title:'StamenTerrain'
    })

    //创建图层集
    const baseLayerGroup = new ol.layer.Group({
        layers: [
            openStreetMapStandard,openStreetMapHumanitarian,stamenTerrain
        ]
    })


    //可以通过控制台查看e有哪些属性，这里我们取我们需要的坐标
    map.on('click',function(e){
        //console.log(e.coordinate);
    })

    //添加单个图层
    map.addLayer(stamenTerrain);
    //添加图层集
    map.addLayer(baseLayerGroup);


    //切换图层，通过访问sidebar中的所有input
    const baseLayerElements = document.querySelectorAll('.sidebar > input[type=radio]');
    //console.log(baseLayerElements);//查看创建的对象包含什么-->input数组
    for(let baseLayerElement of baseLayerElements){
        console.log(baseLayerElement);//逐个访问


        baseLayerElement.addEventListener('change',function(){
            //console.log(this);//查看change事件是否作用
            //console.log(this.value);//查看我们需要访问的属性值
            let baseLayerElementValue = this.value;


            //通过getLayers方法获得图层组
            //使用forEach访问其中的图层(说明文档：The function to call for every element. This function takes 3 arguments (the element, the index and the array). The return value is ignored)         
            baseLayerGroup.getLayers().forEach(function(element, index, array){
                //console.log(element);//查看forEach的参数-->所有图层信息
                //console.log(element.getKeys());//查看图层的属性名
                //console.log(element.get('title'));
                let baseLayerTitle = element.get('title');

                //使用setVisible方法控制是否可见(不需要设置参数)
                element.setVisible(baseLayerTitle === baseLayerElementValue);
                //console.log('baseLayerTitle: '+ baseLayerTitle, 'baseLayerElementValue: ' + baseLayerElementValue);//验证
                //console.log(element.get('title'), element.get('visible'));
            });
            
        })
    }


    //自定义样式
    const fillStyle = new ol.style.Fill({
        color: [84, 118, 225, 0.7]//蓝色
    })

    const strokeStyle = new ol.style.Stroke({
        color:[46, 45, 45, 1],//黑色
        width: 1.2
    })

    const circleStyle = new ol.style.Circle({
        fill: new ol.style.Fill({
            color:[245, 49, 5, 1]//红色
        }),
        radius: 7,//半径
        stroke: strokeStyle
    })


    //加载矢量数据
    const CountriesGeoJSON = new ol.layer.VectorImage({
        source: new ol.source.Vector({
            url:'./Data/Chinamap.geojson',
            //指定数据类型
            format: new ol.format.GeoJSON()
            //这里坐标系和投影是一致的，所以不需要特别指定
        }),
        visible: true,
        title: 'CountriesGeoJSON',
        style: new ol.style.Style({
            //指定样式
            fill: fillStyle,
            stroke: strokeStyle,
            image: circleStyle
        })
    })
    map.addLayer(CountriesGeoJSON);




    //使用overlay方法创建叠加层，
    //必须属性element用于关联html元素
    //必须提供关联地图坐标
    const overlayContainerElement = document.querySelector('.overlay-container');
    const overlayLayer = new ol.Overlay({
        element: overlayContainerElement
    })
    map.addOverlay(overlayLayer);
    const overlayFeatureName = document.getElementById('feature-name');
    const overlayFeatureInfo = document.getElementById('feature-info');


    //操作矢量数据
    map.on('click',function(e){
        //添加一个事件，用于只要点击-->就清空位置信息-->没有位置信息的overlay对象会消失
        overlayLayer.setPosition(undefined);


        //查看点击时发生什么，能获取到什么
        //发现不仅可以获取之前用过的地理坐标，还可以获取到pixel属性（屏幕坐标）
        //console.log(e);
        

        //使用forEachFeatureAtPixel方法，检测与视口上的像素相交的特征，并对每个相交的特征执行回调。检测中包含的层可以通过layerFilter选项在opt_options中配置。

        //该方法需要的第一个参数pixel,是点击事件可以直接获取的
        //该方法的回调函数(包含两个参数festure, layer)
        map.forEachFeatureAtPixel(e.pixel, function(feature, layer){
            let clickedCoordinate = e.coordinate;
            //console.log(feature);//查看回调函数的内容
            //console.log(feature.getKeys());//查看属性名
            //console.log(feature.get('name'));//调用属性
            let clickedFeatureName = feature.get('name');
            let clickedFeatureInfo = feature.get('info');
            //console.log(clickedFeatureName, clickedFeatureInfo)//检验变量
            overlayLayer.setPosition(clickedCoordinate);
            overlayFeatureName.innerHTML = clickedFeatureName;
            overlayFeatureInfo.innerHTML = clickedFeatureInfo;
        },
        //forEachFeatureAtPixel方法的第三个参数
        {
            layerFliter: function(layerCandidate){
                return layerCandidate.get('title') === "CountriesGeoJSON"
            }


        })
    })

}



