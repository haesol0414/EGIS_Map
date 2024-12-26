var Module = {
    locateFile : function(s) {
        return "https://cdn.xdworld.kr/latest/"+ s;
    },
    postRun: function() {
        // Call engine initialization API(essential)
        Module.initialize({
            container: document.getElementById("xd-map"),
            terrain : {
                dem : {
                    url : "https://xdworld.vworld.kr",
                    name : "dem",
                    servername : "XDServer3d",
                    encoding : true
                },
                image : {
                    url : "https://xdworld.vworld.kr",
                    name : "tile",
                    servername : "XDServer3d"
                }
            },
            worker : {
                use : true,
                path : "./worker/XDWorldWorker.js",
                count : 5
            },
            defaultKey : "DFG~EpIREQDmdJe1E9QpdBca#FBSDJFmdzHoe(fB4!e1E(JS1I=="
        });

        // Set camera position
        Module.XDSetCamPositionLonLat(128.555323, 35.814567, 1000000, 90);
    }
};
