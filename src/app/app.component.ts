import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Quagga from 'quagga';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  errorMessage: string;

  shoppingCart= [];
  state:boolean;
  lastScannedCode: string;
  private lastScannedCodeDate: number;

  constructor() {    
  }

  ngOnInit(){
    this.state=false;
  }
  
  ngAfterViewInit(): void {
    if (!navigator.mediaDevices || !(typeof navigator.mediaDevices.getUserMedia === 'function')) {
      this.errorMessage = 'getUserMedia is not supported';
      return;
    }
    this.changequaggastate();
    
   }


   initscanner(){
    Quagga.init({
      frequency:1,
      inputStream: {
        constraints: {
          facingMode: 'environment'
        },
        area: { // defines rectangle of the detection/localization area
          top: '10%',    // top offset
          right: '10%',  // right offset
          left: '10%',   // left offset
          bottom: '10%'  // bottom offset
        },
      },
      decoder: {
        readers: ['code_128_reader']
      },
    },
    (err) => {
      if (err) {
        this.errorMessage = `QuaggaJS could not be initialized, err: ${err}`;
      } else {
        Quagga.start();
        Quagga.onDetected((res) => {
          this.onBarcodeScanned(res.codeResult.code);
          this.state=false;
        });
      }
    });
   }
   changequaggastate(){
     if (this.state){
      Quagga.stop();
      this.state=!this.state;
     }
     else {
      this.state=!this.state;
      setTimeout(() => {
        this.initscanner();
      }, 500);
      
     }

   }

  onBarcodeScanned(code: string) {    
    // ignore duplicates for an interval of 1.5 seconds
    console.log("OK:",code);
    const now = new Date().getTime();
    if ((code === this.lastScannedCode && (now < this.lastScannedCodeDate + 1500)) || code.length!==15 || !this.luhn_check(code)) {
      return;
    }
    else {
      this.lastScannedCode= code;
      this.lastScannedCodeDate = now;
      this.changequaggastate();
    }
    
    // this.changeDetectorRef.detectChanges();
  }

  luhn_check(value) {
    // Accept only digits, dashes or spaces
    if (/[^0-9-\s]+/.test(value)) return false;
  
    // The Luhn Algorithm. It's so pretty.
    let nCheck = 0, bEven = false;
    value = value.replace(/\D/g, "");
  
    for (var n = value.length - 1; n >= 0; n--) {
      var cDigit = value.charAt(n),
          nDigit = parseInt(cDigit, 10);
  
      if (bEven && (nDigit *= 2) > 9) nDigit -= 9;
  
      nCheck += nDigit;
      bEven = !bEven;
    }
  
    return (nCheck % 10) == 0;
  }

}
