
import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, LoadingController, ToastController, AlertController} from 'ionic-angular';
import {Camera, CameraOptions} from '@ionic-native/camera';
import {FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';

import {HomePage} from '../home/home';

@IonicPage()
@Component({
  selector: 'page-report', 
  templateUrl: 'report.html'
})

export class ReportPage {
  public reportForm : FormGroup;
  public title : FormControl;
  public descpt : FormControl;
  public fname : FormControl;
  public sname : FormControl;
  public location : number;
  public imageURI:any;
  public imageFileName:any;

  constructor(
    private transfer: FileTransfer,
    public fb : FormBuilder,  
    private camera : Camera, 
    private navCtrl : NavController, 
    private navParams : NavParams, 
    private loadingCtrl : LoadingController,
    private alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public http: HttpClient)
  {
    this.location= navParams.get('location');
    this.title = fb.control('', Validators.required);
    this.descpt = fb.control('', Validators.required);
    this.fname = fb.control('', Validators.required);
    this.sname = fb.control('', Validators.required);
    this.reportForm = fb.group({
      'title': this.title, 
      'descpt': this.descpt, 
      'fname': this.fname, 
      'sname': this.sname
    })
  }

  ionViewDidLoad() {
    console.log(this.location);
  }

  takePicture() {
    const imgCam: CameraOptions={
      quality: 50,
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: this.camera.PictureSourceType.CAMERA,
      encodingType: this.camera.EncodingType.JPEG
    }
    
    this.camera.getPicture(imgCam).then((imageData) => {
        this.imageURI = imageData;
        this.imageFileName=imageData.substr(imageData.lastIndexOf('/') + 1);
      }, (err) => {
        console.log(err);
      });
  }

  submit() {
    let loader = this.loadingCtrl.create({content: "กำลังบันทึกข้อมูล.."});    
    let title = this.reportForm.controls['title'].value;
    let descpt = this.reportForm.controls['descpt'].value;
    let fname = this.reportForm.controls['fname'].value;
    let sname = this.reportForm.controls['sname'].value;
    let lat = this.location[0];
    let lon = this.location[1];
    let img64 = this.imageFileName;
   
    let data = JSON.stringify({
      'lat':lat,
      'lon':lon,
      'title':title,
      'descpt':descpt,
      'fname':fname,
      'sname':sname,
      'img64':img64
    });

    loader.present();    
    this.http.post('https://www.gistnu.com/service/fixup_report.php', data)
    .subscribe(res => {
      loader.dismiss();
    }, error => {
      console.log("Oooops!");
      loader.dismiss();
    });

    //upload image
    const fileTransfer: FileTransferObject = this.transfer.create();
    let options: FileUploadOptions = {
      fileKey: 'file',
      fileName: this.imageFileName,      
      chunkedMode: false,
      mimeType: "image/jpeg",
      headers: {}
    }
  
    fileTransfer.upload(this.imageURI, 'https://www.gistnu.com/service/fixup_upload.php', options)
    .then(res => {   
      loader.dismiss(); 
      this.gotoHome();      
      let alert=this.alertCtrl.create({
        title: 'ส่งข้อมูลสำเร็จ!',
        subTitle: 'ข้อมูลของคุณถูกส่งเข้าสู่ระบบเรียบร้อยแล้ว',
        buttons:['ok']
      });
      alert.present();     
      //this.presentToast("Image uploaded successfully");
    }, (err) => {
      loader.dismiss();
      this.presentToast(err);
    });
  }  
  
  presentToast(msg) {
      let toast = this.toastCtrl.create({
        message: msg,
        duration: 6000,
        position: 'bottom'
      });  
      toast.onDidDismiss(() => {
        console.log('Dismissed toast');
      });  
      toast.present();
  } 

  gotoHome(){
      this.navCtrl.setRoot(HomePage, {
        
      })
  }

}
