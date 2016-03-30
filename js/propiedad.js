var codi_finca;
function initCal(d)
{
    var dies = d;
    var date_range = $('#date-range12').dateRangePicker({
        inline:true,
        customTopBar: 'Seleccione el dia de entrada y salida',
        container: '#content',
        stickyMonths: true,
        startOfWeek: 'monday',
        language: 'es',
        alwaysOpen:true,
        format: 'DD/MM/YYYY',
        separator : '#',
        beforeShowDay: function(t)
        {
            //Comprovar dies ja seleccionats
            var valid = true;
            for (var i = 0; i < dies.length; i++) {
                if (dies[i].getDate() == t.getDate() && dies[i].getMonth() == t.getMonth() && dies[i].getFullYear() == t.getFullYear()) {
                    valid = false;
                    break;
                }   
            }
            var _class = valid ? '' : 'disabled';
            var _tooltip = valid ? '' : '1';
            return [valid,_class,_tooltip];
        }
    })
    .bind('datepicker-first-date-selected', function(event, obj)
    {
        $('#pagament').addClass('hidden');
    })
    .bind('datepicker-change',function(event,obj)
    {
        var str = $('#date-range12').val();
        $('#pagament').removeClass('hidden');
        $('#entrada').val(str.substr(0, str.indexOf("#")));
        $('#salida').val(str.substr(str.indexOf("#")+1), str.length);
    });
}

mapaPropiedad = '';
function startMap(p){
    var opt = {
        center: p,
        zoom: 10
    };
    mapaPropiedad = new google.maps.Map(document.getElementById("mapP"), opt);
    addmarkerPropiedad(p);
}

 function addmarkerPropiedad(p) {
     var marker = new google.maps.Marker({
     position: p,
     title: 'titol',
     clickable: true,
     map: mapaPropiedad
     });
 }

 //Nomes carregam el mapa si es clica damunt el boto
function mapa(long, latitud) {
    var w = screen.width;
    if(w > 800){
        w = w/3;
    }else{
        w = w/2;
    }
    document.getElementById('mapP').style.height = w+'px';
    var pos = new google.maps.LatLng(latitud, long);
    setTimeout(function(){startMap(pos);}, 50);

}

var dies = [];

function pintarCalendari(xml, codi){
    var xmlDoc = xml.responseXML;
    var fincas = xmlDoc.getElementsByTagName("finca");
    var finca;
    var i;

    for (i = 0; i < fincas.length; i++) {
        if (parseInt(fincas[i].getElementsByTagName('codi')[0].textContent) == codi) {
            finca = fincas[i];
            break
        }
    }

    var calendario = (finca.getElementsByTagName('calendario')[0]);
    var registres = calendario.getElementsByTagName('registre');

    for (i = 0; i < registres.length; i++) {
        var dia = parseInt(registres[i].getElementsByTagName('dia')[0].textContent);
        var mes = parseInt(registres[i].getElementsByTagName('mes')[0].textContent);
        //Restam -1 xq es més comença a 0
        mes = mes - 1;
        var any = parseInt(registres[i].getElementsByTagName('any')[0].textContent);
        var cuants = parseInt(registres[i].getElementsByTagName('ndias')[0].textContent);
        d = new Date(any, mes, dia)
        dies.push(d);
        var idx;
        for (idx = 1; idx < cuants; idx++) {
            var d1 = null;
            d1 = new Date(d.getTime());
            var inc = d1.getDate();
            inc = inc + idx;
            d1.setDate(inc);
            dies.push(new Date(d1));
        }
    }
}

function cal(codi) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            pintarCalendari(xhttp, codi);
            mitjaVal(xhttp, codi);
            initCal(dies);
        }
    };
    xhttp.open("GET", "xml/fincas.xml", true);
    xhttp.send();
}

function initPropiedad(c){
    codi_finca = c;
    initStar();
    initFlex();
    cal(c);
    $('#preu').click(function() {
        $("html, body").animate({ scrollTop: $('#date-range12').offset().top }, 1000);
    });
}

function initFlex(){
    var div = 14;
    if (screen.width < 850) {
        div = 8;
    }else if (screen.width < 450) {
        div = 6;
    }
    var x = screen.availWidth;
    item = 0+(x/div);

    $('#carousel').flexslider({
        animation: "slide",
        controlNav: false,
        animationLoop: false,
        slideshow: false,
        itemWidth: item,
        itemMargin: 4,
        asNavFor: '#slider'
    });
    $('#slider').flexslider({
        animation: "slide",
        controlNav: false,
        animationLoop: false,
        slideshow: false,
        sync: "#carousel",
        start: function(slider){
            $('body').removeClass('loading');
        }
    });
};


function initStar(){

    $(".est_comment").rating({
        min:0,
        max:5,
        step:0.5,
        size:'xs', 
        stars:5,
        readonly: true,
        showClear: false,
        showCaption: false
    });
    $("#input-id2").rating({
        min:0,
        max:5,
        step:1,
        size:'xs', 
        stars:5,
        showClear: false,
        showCaption: false
    });
}

function submitdata()
{
    var name = $('#name').val();
    var rate = $('#input-id2').val();
    var opinio = $('#opinio').val();
    var dataString = 'nom='+ name + '&valor=' + rate + '&opinio=' + opinio+'&codigo='+codi_finca;

    $.ajax({
        type: 'get',
        url: 'php/savecoment.php',
        data: dataString,
        success: function (response) {
            //Quan hem escrit correctament es comentari
            actualitzar(name, rate, opinio);
        }   
    });
    //Retornam null xq sa web no actualitzi
    return false;
}

function actualitzar(name, rate, opinio){
    //Ficam es nou comentari a sa llista
    $('#lista1').append('<li id="coment" class="media">'+
            '<div id="cm" class="media-body">'+
                '<h4 id="nom_comment" class="media-heading">'+name+'</h4>'+
                '<p>'+opinio+'</p>'+
                '<input class="est_comment_add" value="'+rate+'"></input>'+
                '</input>'+
            '</div>'+
        '</li><hr></hr>');

    //Iniciam les estrelles del nou calendari
    $('.est_comment_add').rating({
        min:0,
        max:5,
        step:1,
        size:'xs', 
        stars:5,
        showClear: false,
        showCaption: false
    });

    $('#name').val("");
    $('#input-id2').val("0");
    $('#opinio').val("");
    $("#comentari").html('<h3 class="gracias">Gracias por tu comentario</>');
}   

function mitjaVal(xml, codi){
    var mitja = 0;
    var contador = 0;
    var xmlDoc = xml.responseXML;
    var fincas = xmlDoc.getElementsByTagName("finca");
    var finca;
    var i;

    for (i = 0; i < fincas.length; i++) {
        if (parseInt(fincas[i].getElementsByTagName('codi')[0].textContent) == codi) {
            finca = fincas[i];
            break
        }
    }
    var comentarios = (finca.getElementsByTagName('comentarios')[0]);
    var comentario = comentarios.getElementsByTagName('comentario');

    if (comentario.length == 0) {
        $('#estrelles').append('<input id="input-id" value="0"></input>');
        $("#input-id").rating({
            min:0,
            max:5,
            step:0.5,
            size:'sm', 
            stars:5,
            readonly: true,
            showClear: false,
            showCaption: false
        });
        return;
    }

    for (i = 0; i < comentario.length; i++) {
        var val = parseInt(comentario[i].getElementsByTagName('valoracion')[0].textContent);
        mitja = mitja + val;
        contador = contador + 1;
    }
    mitja = mitja/contador;
    $('#estrelles').append('<input id="input-id" value="'+mitja+'"></input>');
    $("#input-id").rating({
        min:0,
        max:5,
        step:0.5,
        size:'sm', 
        stars:5,
        readonly: true,
        showClear: false,
        showCaption: false
    });
}      

function reserva(){
    var entrada = $('#entrada').val();
    var sortida = $('#salida').val();
    var date_entrada = moment(entrada, "DD/MM/YYYY").toDate();
    var date_salida = moment(sortida, "DD/MM/YYYY").toDate();
    var de = new Date(date_entrada);
    var ds = new Date(date_salida);

    var e = parseInt(de.getTime());
    var s = parseInt(ds.getTime());
    var timeDiff = Math.abs(s - e);
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    diffDays = diffDays + 1;
    var mes = de.getMonth() + 1;

    var dataString = 'd='+ de.getDate() + '&m=' + mes + '&a=' + de.getFullYear()+'&nd='+diffDays+'&codigo='+codi_finca;

    $.ajax({
        type: 'get',
        url: 'php/saveday.php',
        data: dataString,
        success: function (response) {
            //Quan hem escrit correctament es comentari
            $("#pagament").html('<h3 class="gracias">Reserva realizada con &#233;xito</>');
        }   
    });
    //Retornam null xq sa web no actualitzi
    return false;
}       