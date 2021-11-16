var min = 99;
var max = 999999;
var polygonMode = true;
var pointArray = new Array();
var lineArray = new Array();
var activeLine;
var activeShape = false;
var canvas;

canvas = new fabric.Canvas("canvas");

document.getElementById("file").addEventListener("change", function (e) {
  var file = e.target.files[0];
  var reader = new FileReader();
  reader.onload = function (f) {
    var data = f.target.result;
    fabric.Image.fromURL(data, function (img) {
      var oImg = img
        .set({ left: 0, top: 0, angle: 00, width: 800, height: 600 })
        .scale(0.9);

      canvas.setBackgroundImage(oImg);
      canvas.renderAll();
    });
  };
  reader.readAsDataURL(file);
});

$(window).load(function () {
  prototypefabric.initCanvas();
  $("#create-polygon").click(function () {
    prototypefabric.polygon.drawPolygon();
  });
});

var prototypefabric = new (function () {
  this.initCanvas = function () {
    canvas.setWidth($(window).width());
    canvas.setHeight($(window).height() - $("#nav-bar").height());
    canvas.on("mouse:down", function (options) {
      if (options.target && options.target.id == pointArray[0].id) {
        prototypefabric.polygon.generatePolygon(pointArray);
      }
      if (polygonMode) {
        prototypefabric.polygon.addPoint(options);
      }
    });

    canvas.on("mouse:up", function (options) {});
    canvas.on("mouse:move", function (options) {
      if (activeLine && activeLine.class == "line") {
        var pointer = canvas.getPointer(options.e);
        activeLine.set({ x2: pointer.x, y2: pointer.y });

        var points = activeShape.get("points");
        points[pointArray.length] = {
          x: pointer.x,
          y: pointer.y,
        };
        activeShape.set({
          points: points,
        });
        canvas.renderAll();
      }
      canvas.renderAll();
    });
  };
})();

prototypefabric.polygon = {
  drawPolygon: function () {
    polygonMode = true;
    pointArray = new Array();
    lineArray = new Array();
    activeLine;
  },

  addPoint: function (options) {
    var random = Math.floor(Math.random() * (max - min + 1)) + min;
    var id = new Date().getTime() + random;
    var circle = new fabric.Circle({
      radius: 5,
      fill: "#ffffff",
      stroke: "#333333",
      strokeWidth: 0.5,
      left: options.e.layerX / canvas.getZoom(),
      top: options.e.layerY / canvas.getZoom(),
      selectable: false,
      hasBorders: false,
      hasControls: true,
      originX: "center",
      originY: "center",
      id: id,
      objectCaching: false,
    });

    if (pointArray.length == 0) {
      circle.set({
        fill: "red",
      });
    }

    var points = [
      options.e.layerX / canvas.getZoom(),
      options.e.layerY / canvas.getZoom(),
      options.e.layerX / canvas.getZoom(),
      options.e.layerY / canvas.getZoom(),
    ];

    line = new fabric.Line(points, {
      strokeWidth: 2,
      fill: "#999999",
      stroke: "#999999",
      class: "line",
      originX: "center",
      originY: "center",
      selectable: true,
      hasBorders: false,
      hasControls: false,
      evented: false,
      objectCaching: false,
    });

    if (activeShape) {
      var pos = canvas.getPointer(options.e);
      var points = activeShape.get("points");

      points.push({
        x: pos.x,
        y: pos.y,
      });

      var polygon = new fabric.Polygon(points, {
        stroke: "#333333",
        strokeWidth: 1,
        fill: "#cccccc",
        opacity: 0.3,
        selectable: false,
        hasBorders: false,
        hasControls: false,
        evented: false,
        objectCaching: false,
      });

      canvas.remove(activeShape);
      canvas.add(polygon);
      activeShape = polygon;
      canvas.renderAll();
    } else {
      var polyPoint = [
        {
          x: options.e.layerX / canvas.getZoom(),
          y: options.e.layerY / canvas.getZoom(),
        },
      ];

      var polygon = new fabric.Polygon(polyPoint, {
        stroke: "#333333",
        strokeWidth: 1,
        fill: "#cccccc",
        opacity: 0.3,
        selectable: false,
        hasBorders: false,
        hasControls: false,
        evented: false,
        objectCaching: false,
      });

      activeShape = polygon;
      canvas.add(polygon);
    }

    activeLine = line;
    pointArray.push(circle);
    lineArray.push(line);
    canvas.add(line);
    canvas.add(circle);
    canvas.selection = false;
  },

  generatePolygon: function (pointArray) {
    var points = new Array();
    $.each(pointArray, function (index, point) {
      points.push({
        x: point.left,
        y: point.top,
      });
      canvas.remove(point);
    });

    $.each(lineArray, function (index, line) {
      canvas.remove(line);
    });

    canvas.remove(activeShape).remove(activeLine);

    var polygon = new fabric.Polygon(points, {
      stroke: "#333333",
      strokeWidth: 0.5,
      fill: "red",
      opacity: 1,
      hasBorders: false,
      hasControls: true,
    });

    canvas.add(polygon);

    activeLine = null;
    activeShape = null;
    polygonMode = false;
    canvas.selection = true;
  },
};

function polygonPositionHandler(dim, finalMatrix, fabricObject) {
  var x = fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x,
    y = fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y;
  return fabric.util.transformPoint(
    { x: x, y: y },
    fabric.util.multiplyTransformMatrices(
      fabricObject.canvas.viewportTransform,
      fabricObject.calcTransformMatrix()
    )
  );
}

function actionHandler(eventData, transform, x, y) {
  var polygon = transform.target,
    currentControl = polygon.controls[polygon.__corner],
    mouseLocalPosition = polygon.toLocalPoint(
      new fabric.Point(x, y),
      "center",
      "center"
    ),
    polygonBaseSize = polygon._getNonTransformedDimensions(),
    size = polygon._getTransformedDimensions(0, 0),
    finalPointPosition = {
      x:
        (mouseLocalPosition.x * polygonBaseSize.x) / size.x +
        polygon.pathOffset.x,
      y:
        (mouseLocalPosition.y * polygonBaseSize.y) / size.y +
        polygon.pathOffset.y,
    };
  polygon.points[currentControl.pointIndex] = finalPointPosition;
  canvas.on({
    "touch:gesture": function () {
      var text = document.createTextNode(" Gesture ");
      info.insertBefore(text, info.firstChild);
    },
    "touch:drag": function () {
      var text = document.createTextNode(" Dragging ");
      info.insertBefore(text, info.firstChild);
    },
    "touch:orientation": function () {
      var text = document.createTextNode(" Orientation ");
      info.insertBefore(text, info.firstChild);
    },
    "touch:shake": function () {
      var text = document.createTextNode(" Shaking ");
      info.insertBefore(text, info.firstChild);
    },
    "touch:longpress": function () {
      var text = document.createTextNode(" Longpress ");
      info.insertBefore(text, info.firstChild);
    },
  });

  return true;
}
