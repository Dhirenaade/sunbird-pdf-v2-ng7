import { Component, OnInit, Input, HostListener, Output, EventEmitter, OnDestroy } from '@angular/core';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import {
  PagesLoadedEvent, PageRenderedEvent,
  PdfDownloadedEvent, PdfLoadedEvent, TextLayerRenderedEvent, ScaleChangingEvent
} from 'ngx-extended-pdf-viewer/public_api';

import { IPlayerEvent, PdfComponentInput } from './playerEvents';

@Component({
  selector: 'sb-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.css']
})

export class PdfViewerComponent implements OnInit, OnDestroy {
  @Input() pdfConfig: PdfComponentInput;
  @Output() sendMetadata: EventEmitter<object> = new EventEmitter<IPlayerEvent>();

  private currentPagePointer: number;
  private totalNumberOfPages: number;
  private pdfPlayerStartTime: number;
  private pdfLastPageTime: number;
  public pdfPlayerEvent: IPlayerEvent = {
    eventType: '',
    metaData: {
      numberOfPagesVisited: 0,
      totalNumberOfPages: 0,
      currentPagePointer: 0,
      pageDuration: [],
      highlights: [],
      sessionId: '',
      userPlayBehavior: []
    }
  };

  public messages: Array<string> = [];
  public showBorders = false;
  public visits = [];
  public _searchText = '';


  constructor(
    private ngxExtendedPdfViewerService: NgxExtendedPdfViewerService,
   ) { }

  ngOnDestroy(): void {
     this.setPlayerEvent('END', this.currentPagePointer, this.totalNumberOfPages, this.currentPagePointer, this.visits);
  }

  ngOnInit(): void {
    this.pdfPlayerStartTime = this.pdfLastPageTime =  new Date().getTime();
  }


  public setPlayerEvent(eventType: string, numberOfPagesVisited: number, numberOfPages: number,
    currentPage: number, pageDuration?: Array<object>,  highlights?: Array<object>) {
    this.pdfPlayerEvent.eventType = eventType;
    this.pdfPlayerEvent.metaData.numberOfPagesVisited = Number(numberOfPagesVisited) ;
    this.pdfPlayerEvent.metaData.totalNumberOfPages = numberOfPages;
    this.pdfPlayerEvent.metaData.currentPagePointer = currentPage;
    this.pdfPlayerEvent.metaData.pageDuration = pageDuration;
    this.pdfPlayerEvent.metaData.highlights = highlights;
    this.sendMetadata.emit(this.pdfPlayerEvent);
  }

  public onPagesLoaded(event: PagesLoadedEvent) {
    this.totalNumberOfPages = event.pagesCount;
    // console.log('onPagesLoaded: Document loaded with ' + event + ' pages');
  }

  public onPageRendered(event: PageRenderedEvent) {
    this.currentPagePointer = event.pageNumber;
    const tags = {
      'page' : this.currentPagePointer,
      'spentTime' : new Date().getTime() - this.pdfLastPageTime
    };
    this.visits.push (tags);
    this.pdfLastPageTime = new Date().getTime();
    this.setPlayerEvent('HEARTBEAT', this.currentPagePointer, this.totalNumberOfPages, this.currentPagePointer, this.visits);
    // console.log(event);
  }

  public onPdfLoaded(event: PdfLoadedEvent): void {
    this.setPlayerEvent('START', this.currentPagePointer, this.totalNumberOfPages, this.currentPagePointer, this.visits);
    // console.log('onPdfLoaded PDF loaded with ' + event.pagesCount + ' pages');
  }

  public onScaleChange(event: ScaleChangingEvent): void {
    console.log(event);
  }

  public onPdfLoadFailed(error: Error): void {
    this.setPlayerEvent('FAILED', this.currentPagePointer, this.totalNumberOfPages, this.currentPagePointer, this.visits);
    // console.log('onPdfLoadFailed');
    // console.log(error);
  }

  public onSourceChange(event: string) {
    // console.log('onSourceChange Source changed. The new file is ' + event);
  }

  public onZoomChange(event: any): void {
    this.setPlayerEvent('HEARTBEAT', this.currentPagePointer, this.totalNumberOfPages, this.currentPagePointer, this.visits);
    // console.log('onZoomChange');
    // console.log(event);
  }

  public onTextLayerRendered(event: TextLayerRenderedEvent): void {
    // console.log('onTextLayerRendered');
    // console.log(event);
  }

  public getSelect(event: any) {
    // console.log(event);
  }

}
