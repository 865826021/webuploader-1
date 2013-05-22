<?php
$rawdata = file_get_contents('php://input');
$data = json_decode($rawdata, true);
//var_dump($data);
foreach($data as $file){
	//var_dump($file);
	write_file($file);
}
function write_file($file) {
  $binaryImg = str_replace( 'data:image/jpeg;base64,', '', $file['file'] );
  $binaryImg = base64_decode( $binaryImg );
  file_put_contents( 'tmp/' . $file['name'], $binaryImg );
}