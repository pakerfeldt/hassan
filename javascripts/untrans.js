
function findUntrans() {
	var vol1 = ["1_parkering.json", "2_foraldraforeningen_for_narkotika.json", "3_ar_det_fel_pa_bilen.json", "4_ungdomsblocket.json", "5_wienerkonditoriet.json", "6_do_the_choka_choka.json", "7_schampo_for_fett_har.json", "8_alltsa_sa_har_var_det.json", "9_mc-klubben.json", "10_frodenkvist_tvattskurken.json", "11_sheraton_kairo.json", "12_baskaggen.json", "13_pa_museet.json", "14_kan_man_roka_morotter.json", "15_bukowskis.json", "16_marten_rask_vandringssagner.json", "17_elstangsel.json", "18_laget_i_ryssland.json", "19_williamsparon.json", "20_nassau.json", "21_ja_det_ar_kristian.json", "22_hyrbil.json", "23_ar_du_allvarlig.json", "24_meja.json", "25_lassmeden.json", "26_roffes_morsa.json", "27_palindrom.json", "28_byxmode.json"];

	for (var i = 0; i < vol1.length; i++) {
	//	console.log("https://raw.github.com/pakerfeldt/hassan/master/trans/williamsparon_vol_1/" + vol1[i]);
	};
	
	$.ajax({
	  type: "GET",
	  url: "https://raw.github.com/pakerfeldt/hassan/master/trans/williamsparon_vol_1/" + vol1[6],
	  dataType: "text",
	  contentType: "text/plain; charset=utf-8",
	  success: function(data, textStatus){
	    alert("data: " + data);
	  },
	  error: function(data){
	    alert("error");
	  }
	});


	$.getJSON("https://raw.github.com/pakerfeldt/hassan/master/trans/williamsparon_vol_1/" + vol1[6] + "?jsoncallback=?",
        function(data){
        	console.log("test");
        });

}
/*
          $.each(data.items, function(i,item){
            $("<img/>").attr("src", item.media.m).appendTo("#images");
            if ( i == 3 ) return false;
*/