d3.csv("https://drive.google.com/file/d/12oZV7PWG_UHn8hRe_8Ov4sNMdLDCQ6sW/view?usp=sharing", function(data) {
    for (var i = 0; i < data.length; i++) {
        console.log(data[i].Name);
        console.log(data[i].Age);
    }
});