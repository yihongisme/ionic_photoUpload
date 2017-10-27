import { Component } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { ActionSheetController,Platform,ToastController } from 'ionic-angular';

declare var cordova: any;                         //注意这里，添加cordova



@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
  })
  export class CertificationPage {
    public lastImage;



    constructor(

    public actionSheetCtrl: ActionSheetController,
    public platform: Platform,
    private toastCtrl: ToastController,
    private camera: Camera,   
    private transfer: FileTransfer, 
    private file: File, 
    private filePath: FilePath){

    }

 	//上传活动图片
     uploadimg(){
        //打开上拉菜单 
        //拿到方法传过来的参数进行后面的判断
         
         let actionSheet = this.actionSheetCtrl.create({
          
            buttons: [
              {
                text: '从相册选择',
                handler: () => {
                  this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
                 }
               },
              {
      
                text: '拍照',
                handler: () => {
                  this.takePicture(this.camera.PictureSourceType.CAMERA);
                }
             }, 
              {
                text: '取消',
                role: 'cancel',
                handler: () => {
                }
              }
            ]
          });
          actionSheet.present();
          
      }
      
      //获取图片路径以及调用拍照功能
      public takePicture(sourceType) {

        // Create options for the Camera Dialog
        var options = {
          width: 500,//图片的宽度
          height: 500,//图片的高度
          quality: 60,//图片的质量0-100之间选择
          outputType: 1 ,// default .FILE_URI返回影像档的，0表示FILE_URI返回影像档的也是默认的，1表示返回base64格式的图片
          sourceType: sourceType,
          saveToPhotoAlbum: false,
          correctOrientation: true
        };
       
        // Get the data of an image
        this.camera.getPicture(options).then((imagePath) => {
          // Special handling for Android library
          if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
            this.filePath.resolveNativePath(imagePath)
              .then(filePath => {
                let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
                let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
                this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
              
              });
          } else {
            var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
            var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
            this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
          }
        }, (err) => {
          this.presentToast('Error while selecting image.');
        });
    
         
      }
      
      
      //对文件名字做处理
      private createFileName() {
        var d = new Date(),
        n = d.getTime(),
        newFileName =  n + ".jpg";
        return newFileName;
      }
       

      // 将图像复制到本地文件夹
      private copyFileToLocalDir(namePath, currentName, newFileName) {
        this.file.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(success => {
            this.presentToast("success");
            //接住文件名字
            this.lastImage = newFileName;
            
        }, error => {
          this.presentToast('Error while storing file.');
        });
      }
    
      //弹窗效果
      private presentToast(text) {
        let toast = this.toastCtrl.create({
          message: text,
          duration: 3000,
          position: 'top'
        });
        toast.present();
      }
       
      // 总是要找到正确的路径到你的应用文件夹
      public pathForImage(img) {
        if (img === null) {
          return '';
        } else {
          
          return cordova.file.dataDirectory + img;
          
        }
        
      }
      
      //上传功能
      public uploadImage() {
        // Destination URL
        var url ="your server url";
       
        // File for Upload
        var targetPath = this.pathForImage(this.lastImage);
       
        // File name only
        var filename = this.lastImage;
       
        //设置格式样式以及传参
        var options = {
          fileKey: "file",
          fileName: filename,
          headers:{},
          chunkedMode:false,
        };
       
         const fileTransfer: FileTransferObject= this.transfer.create();
        
            fileTransfer.upload(targetPath,encodeURI(url), options).then(data => { 
               alert("成功了");
          }, err => {
            alert("失败了");
          });
        // }
      }
      





}  