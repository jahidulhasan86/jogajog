import {
  Component,
  OnInit,
  AfterViewChecked,
  AfterViewInit,
  NgZone,
  ViewChild,
  Output,
  EventEmitter,
  OnDestroy,
  HostListener
} from '@angular/core';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable, defer, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AccountService } from '../../../shared/services/account/account.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { XmppChatService } from '../../../shared/services/xmpp-chat/xmpp-chat.service';
import * as $ from 'jquery';
// import { GroupService } from '../../group.service';
// import { UiConfig } from '../../../../../assets/uiconfig';
import { GlobalValue } from '../../../global';
import { MessagingService } from '../../../shared/services/messaging/messaging.service';
// import { ContactService } from '../../services/contact_service/contact.service';
// import { HttpFileUpload } from 'src/app/lib/sa-xmpp';
import swal from 'sweetalert2';
// import { CallsComponent } from '../../components/calls/calls.component';
import { ChatService } from '../../../shared/services/chat/chat.service';
import { NotificationService } from '../../../shared/services/notifications/notification.service';
import { GlobalService } from '../../../shared/services/global/global.service';
import { NgxSpinnerService } from 'ngx-spinner';
// tslint:disable: no-use-before-declare
const constprofilePhotoImage = require('../../../../assets/images/default_profile icon.png');
const constloaderImage = require('../../../../assets/images/loader.gif');
const consttypingPlaceholderImage = require('../../../../assets/images/is_typing-preloader2.gif');
const constattachmentImage = require('../../../../assets/images/attachment.png');
const constsendImage = require('../../../../assets/images/chat_send_icon.png');

declare var require: any;
const linkify = require('linkify-it')();
let connectionStatus = null;
let userStore = null;
let uploadingFileQueue;
@Component({
  selector: 'app-chat-room-box',
  templateUrl: './chat-room-box.component.html',
  styleUrls: ['./chat-room-box.component.scss']
})
export class ChatRoomBoxComponent implements OnInit {
  public profilePhotoImageUrl = '';
  public loaderImageUrl = '';
  public typingPlaceholderImageUrl = '';
  public attachmentImageUrl = '';
  public sendImageUrl = '';

  @Output() onChange: EventEmitter<File> = new EventEmitter<File>();

  public acServices;
  public isConnected;
  public chatlist: Array<any> = [];
  public msg;
  public sentUser;
  public fromUser;
  public roleList: Object;
  public userHierarchyList: Object;
  panelOpenState = false;
  public roleId;
  public selectedGroup;
  public chatStatus;

  public contactShow = true;
  public chatShow = false;
  public meetingShow = false;
  public callShow = false;
  public taskShow = false;
  public notificationsShow = false;
  public groupShow = false;
  public deviceShow = false;
  public roleName;
  // private chatService;
  private message;
  private messagingService;
  isMapActive = false;
  isSendMessage = true;
  latitude = 51.678418;
  longitude = 7.809007;
  loadMoreButton;
  test = true;
  globalValue;
  profile_pic;
  public isAttachMentOpen = false;
  uploadProgress = false;
  public imageLink;
  test1 = 'hi';
  sUser: any;
  private subscriptions: Array<Subscription> = [];
  callScreenSideNavShowData: string;

  constructor(
    private breakpointObserver: BreakpointObserver,
    public dialog: MatDialog,
    public chatService: XmppChatService,
    public acService: AccountService,
    public router: Router,
    messagingService: MessagingService,
    public openViduChatService: ChatService,
    public notificationService: NotificationService, // private callsComponent: CallsComponent
    public globalService: GlobalService,
    private spiner: NgxSpinnerService
  ) {
    // this.chatService=chat;
    this.acServices = acService;
    this.chatStatus = { statusText: '', isVisible: false };
    this.messagingService = messagingService;

    this.profilePhotoImageUrl = constprofilePhotoImage;
    this.loaderImageUrl = constloaderImage;
    this.typingPlaceholderImageUrl = consttypingPlaceholderImage;
    this.attachmentImageUrl = constattachmentImage;
    this.sendImageUrl = constsendImage;
  }

  events: string[] = [];
  users: string[] = [];
  opened: boolean;
  dummyUser = [];
  groups = [];
  group;
  isProgress = false;
  isOpened = false;

  cssdisplay = 'none;';
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(map((result) => result.matches));
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.UiModification();
  }
  ngOnInit() {
    this.isProgress = true;
    let meetingInfo;
    if (!meetingInfo) {
      meetingInfo = this.chatService.selectedGroup;
      meetingInfo.isgroup = true;
      meetingInfo.user_name = meetingInfo.meeting_name;
      meetingInfo.group_name = meetingInfo.meeting_name;
      meetingInfo.user_id = meetingInfo.id;
      meetingInfo.group_id = meetingInfo.id;
      meetingInfo.is_active = meetingInfo.is_active;
      meetingInfo.conferance_id = meetingInfo.id;
      meetingInfo.conferance_name = meetingInfo.meeting_name;
      meetingInfo.conferance_type = 'group';
      meetingInfo.active_class_name = 'active-listItem';
      meetingInfo.company_id = meetingInfo.company_id;
      // meetingInfo.is_company_admin = this.sUser.is_company_admin;
      meetingInfo.created_by = meetingInfo.created_by;
    }

    // this.chatService.selectedGroup = meetingInfo;

    this.sUser = JSON.parse(localStorage.getItem('sessionUser'));
    $('#fileUpload').hide();
    // Store/update ls for last stage tracking
    // localStorage.setItem("backTrackStage", "CHAT_WINDOW");
    if (!this.selectedGroup) {
      this.selectedGroup = this.chatService.selectedGroup;
      console.log('select', this.selectedGroup);
    }
    this.globalValue = GlobalValue;
    // $(".write-msg").css("width", window.innerWidth - 320)
    // check connection
    let clearIntervalid: any;

    userStore = JSON.parse(localStorage.getItem('sessionUser'));
    console.log(this.chatService.connection);
    if (!userStore) {
      // alert('Session not working');
      clearIntervalid = setInterval((x) => {
        userStore = JSON.parse(localStorage.getItem('sessionUser'));
      }, 1000);
    } else {
      if (clearIntervalid) {
        clearInterval(clearIntervalid);
      }
      // user = { username: userStore.user_name, password: userStore.password, user_id: userStore.id };
      this.messagingService.requestPermission(userStore);
      this.chatService.checkConnection(userStore);
    }

    // this.messagingService.receiveMessage() /////////saima commented . notif count works fine now
    this.message = this.messagingService.currentMessage;

    this.subscriptions.push(
      this.chatService.onStatusChange$.subscribe((status) => {
        connectionStatus = status;
      })
    );
    // if (this.chatService.chats.length > 0) {
    //   var element = document.getElementById("nomoremessage");
    //   element.classList.remove("nomoremessage");
    // }
    // check connection

    this.chatService.subscribeSendRequest();
    if (this.chatService.getConnection() != null) {
      if (this.chatService.getConnection().connected === true) {
        this.isConnected = true;
      }
    }
    // on selected change
    this.subscriptions.push(
      this.chatService.chatProgress$.subscribe((val) => {
        this.isProgress = val;
      })
    );

    // on change loadmore button
    this.subscriptions.push(
      this.chatService.chatLoadMoreButtonCast.subscribe((val) => {
        this.loadMoreButton = val;
      })
    );

    this.subscriptions.push(
      this.chatService.onSelectedGroup$.subscribe((group) => {
        this.selectedGroup = group;
        console.log('select', this.selectedGroup);
        // selectedGroup.created_by == sUser.id ? true: (sUser.company_id == globalValue.company_id) ? (!selectedGroup.is_pinned || (selectedGroup.is_pinned && selectedGroup.is_allow_contributor)) : sUser.is_company_admin || !selectedGroup.is_pinned || (selectedGroup.is_pinned && selectedGroup.is_allow_contributor)
      })
    );

    this.subscriptions.push(
      this.chatService.chatStatus$.subscribe((chatstatus) => {
        this.chatStatus = chatstatus;
      })
    );

    this.subscriptions.push(
      this.chatService.onConnect$.subscribe((onConnect) => {
        this.isConnected = onConnect;
      })
    );
    // //when connection status changed // retry
    // var globalRetryValue = 0;
    // let intValue: any;
    // this.chatService.onConnect$.subscribe((onConnect) => {
    //   this.isConnected = onConnect;
    //   if (connectionStatus != "AUTHFAIL") {
    //     if (!onConnect && globalRetryValue === 0) {
    //       intValue = setInterval(retry => {
    // this.chatService.checkConnection(user);
    //       }, 2000)
    //     }
    //     else {
    //       if (globalRetryValue === 0) {
    //         globalRetryValue++;
    //         clearInterval(intValue)
    //         var groups = JSON.parse(localStorage.getItem("groups"));
    //         if (groups == null) {
    //           this.groupService.getAllgroup()
    //             .subscribe((result) => {
    //               if (result.status == 'ok') {
    //                 localStorage.setItem('groups', JSON.stringify(result.resultset));
    //                 groups = result.resultset;
    //                 this._connectchatroom(groups);
    //               }
    //             });
    //         }
    //         else {
    //           this._connectchatroom(groups);
    //         }
    //       }
    //     }
    //   } else {
    //     if (globalRetryValue === 0) { Swal("info", "XMPP Authentication failed."); globalRetryValue++ }
    //   }
    // });

    // var allUserListOfCurrentSelectedGroup: any;
    // this.subscriptions.push(
    // 	this.acService.getUserListIdsCast.subscribe((friendlist) => {
    // 		allUserListOfCurrentSelectedGroup = friendlist;
    // 	})
    // );

    // when message come
    this.subscriptions.push(
      this.chatService.onMessage$.subscribe((msg) => {
        const userdetails = { profile_pic: '', username: '' };
        let pushMSG;
        // allUserListOfCurrentSelectedGroup.forEach((element) => {
        // 	if (msg.username == element.user_name) {
        // 		userdetails = element;
        // 	}
        // });
        const newDate = new Date(parseFloat(msg.stamp));
        let splitHashFromMessage;
        if (msg.isCallSession === true) {
          splitHashFromMessage = msg.message.split('#');
        }

        const hasLink = linkify.test(msg.message);
        if (hasLink) {
          const linkData = this.urlify(msg.message);
          msg.msgWithLink = linkData;
        }

        if (msg.username === JSON.parse(localStorage.getItem('sessionUser')).user_name) {
          pushMSG = {
            msg: msg.isCallSession ? splitHashFromMessage[0] : msg.message.replace(/(\r\n|\n)/g, "<br/>"),
            from: '', // "me",
            align: 'right',
            id: msg.id,
            profile_pic: userdetails.profile_pic,
            // "image_url": JSON.parse(localStorage.getItem('sessionUser')).image_url || 'assets/images/icons/user_icon.png',
            stamp: newDate.toLocaleString(undefined, {
              day: 'numeric',
              month: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            isFile: msg.isFile === true ? msg.isFile : false,
            fileType: msg.isFile === true ? msg.fileType : null,
            fileShortName: msg.isFile === true ? msg.fileShortName : null,
            thumbnail: msg.isFile === true && msg.fileType === 'image' ? msg.thumbnail : null,
            isLoader: msg.isLoader === true ? true : false,
            isCallSession: msg.isCallSession === true ? msg.isCallSession : false,
            conferenceId: msg.isCallSession === true ? msg.conferenceId : false,
            callSessionId: msg.isCallSession === true ? msg.callSessionId : false,
            conferenceType: msg.isCallSession === true ? msg.conferenceType : false,
            msgWithLink: msg.msgWithLink,
            // "sendingFailed" : this.isConnected ? true : false,
            sendingFailed: msg.room ? (this.isConnected ? true : false) : true,
            sendingFailedText: this.isConnected ? true : false
          };
        } else {
          pushMSG = {
            msg: msg.isCallSession ? splitHashFromMessage[1] : msg.message.replace(/(\r\n|\n)/g, "<br/>"),
            from: msg.username,
            align: 'left',
            id: msg.id,
            profile_pic: userdetails.profile_pic,
            // "image_url": this.user_image,
            stamp: newDate.toLocaleString(undefined, {
              day: 'numeric',
              month: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            isFile: msg.isFile === true ? msg.isFile : false,
            fileType: msg.isFile === true ? msg.fileType : null,
            fileShortName: msg.isFile === true ? msg.fileShortName : null,
            thumbnail: msg.isFile === true && msg.fileType === 'image' ? msg.thumbnail : null,
            isLoader: false,
            isCallSession: msg.isCallSession === true ? msg.isCallSession : false,
            conferenceId: msg.isCallSession === true ? msg.conferenceId : false,
            callSessionId: msg.isCallSession === true ? msg.callSessionId : false,
            conferenceType: msg.isCallSession === true ? msg.conferenceType : false,
            msgWithLink: msg.msgWithLink,
            sendingFailed: msg.room ? (this.isConnected ? true : false) : true,
            sendingFailedText: this.isConnected ? true : false
          };
          if (!msg.getDataFromService) {
            if (this.callScreenSideNavShowData !== 'chat') {
              this.openViduChatService.addMessageUnread();
              // this.notificationService.xamppNewMessage(msg.username.toUpperCase());
            }
          }
        }

        // is new message
        let newmessage = true;
        for (let i = 0; i < this.chatService.chats.length; i++) {
          if (this.chatService.chats[i].id === pushMSG.id) {
            newmessage = false;
            break;
          } 
        }
        if (newmessage) {
          if (msg.unshift) {
            this.chatService.chats.unshift(pushMSG);
          } else {
            this.chatService.chats.push(pushMSG);
          }
        }
        // if(newmessage && msg.username !== JSON.parse(localStorage.getItem('sessionUser')).user_name) {
        //   this.playSound();
        // }
      })
    );

    // chat list update
    this.subscriptions.push(
      this.chatService.chatList$.subscribe((chat) => {
        this.chatlist = [];
        let tempChatList = [];
        tempChatList = chat;
        for (let i = 0; i < tempChatList.length; i++) {
          if (tempChatList[i].msg === undefined) {
            tempChatList[i].msg = '';
          }
          const hasLink = linkify.test(tempChatList[i].msg);
          if (hasLink) {
            const linkData = this.urlify(tempChatList[i].msg);
            tempChatList[i].msgWithLink = linkData;
          }
        }
        this.chatlist = tempChatList;
        console.log('chatList:', this.chatlist);
        this.UiModification();
      })
    );

    this.selectchatuser(this.chatService.selectedGroup);
  }
  UiModification() {
    const toolbar_header = $('.toolbar_header').height();
    const room_controller = $('#room-controller').height(); // footer part
    const windowHeight = window.innerHeight;
    const middleHeight = windowHeight - (toolbar_header + room_controller);

    if (document.getElementsByClassName('dynHeight')) {
      $('.dynHeight').css('height', middleHeight);
    }
    if (document.getElementsByClassName('main-container-chat')) {
      $('.main-container-chat').css({ height: (middleHeight - 20) + 'px', overflow: 'hidden' });
    }

    const chatHeaderNameHeight = $('.chat-header-name').height() + 10;
    $('.chat-container').css({ height: middleHeight - chatHeaderNameHeight + 'px' });

    $('.chatContainerScroll').css('height', $('.chat-container').height() - $('.textAreaPart').height());

    // let checkExist = setInterval(function () {
    // 	if ($('#conf_chat').length) {

    // 		clearInterval(checkExist);
    // 	}
    // }, 100);

    // var msgInputTextAreaElem = document.getElementById('msgInput');
    // msgInputTextAreaElem.focus();
  }

  isOpenShareResourceArea() {
    if (this.isOpened) {
      this.isOpened = false;
    } else {
      this.isOpened = true;
    }
  }
  ngAfterViewInit() {
		/*
      map search option icon's margin is reduced by 60%
    */
    let self = this;
    document.addEventListener('input', function (event) {
      let targetArea: any = event
      if (targetArea.target.tagName.toLowerCase() !== 'textarea') return;
      self._handleTextAreaSize(event.target);
    }, false);
    $('#fileUpload').hide();
    this.UiModification();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

  urlify(text) {
    const urlRegex = /((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi;
    return text.replace(urlRegex, function (url) {
      return '<a href="' + url + '" target="_blank">' + url + '</a>';
    });
  }

  showInfo() {
    alert('Comming Soon..');
  }

  _connectchatroom(groups) {
    try {
      if (groups != null) {
        for (let i = 0; i < groups.length; i++) {
          this.chatService.connectChatRoom(groups[i].group_id);
        }
      }
    } catch (ex) {
      console.log(ex);
    }
  }

  enter(event) {

    $('#fileUpload').hide(500); // to toggol file picker
    if (event.keyCode === 13 && !event.ctrlKey) {
      this.msg.trim();
      if (this.msg.trim() === '') {
        this.msg = '';
        return;
      }
      if (this.selectedGroup.isgroup === true) {
        this.sendgroupmessage();
      } else {
        this.sendMSG();
      }
    } else {
      if (event.keyCode === 13 && event.ctrlKey) {
        $('textarea#msgInput').val(function (i, val) {
          return val + "\n";
        });
      }
    }
  }

  send() {
    $('#fileUpload').hide(500); // to toggol file picker
    if (this.msg.trim() === '') {
      this.msg = '';
      return;
    }
    if (this.selectedGroup.isgroup === true) {
      this.sendgroupmessage();
    } else {
      this.sendMSG();
    }
  }

  sendMSG() {
    this.sentUser = this.selectedGroup.user_name + '@' + GlobalValue.host;
    const userStore = JSON.parse(localStorage.getItem('sessionUser'));
    if (this.msg === undefined) {
      this.msg = '';
    }
    // this.chatService.checkConnection(userStore);
    console.log(this.chatService.connection);
    if (this.msg !== undefined && this.msg.trim().length > 0) {
      // this._chatService.sendMessage("admin3@ums132.einfochips.com", this.msg);
      const timestamp = new Date().getTime();
      const d = new Date(timestamp); // The 0 there is the key, which sets the date to the epoch

      if (this.chatService.connection != null) {
        this.chatService.sendMessage(this.sentUser, this.msg.trim(), userStore.user_name + '@' + GlobalValue.host, timestamp);
      } else if (this.chatService.connection == null) {
        this.saveChatDataLocally_When_User_Offline(
          this.sentUser,
          this.msg.trim(),
          userStore.user_name + '@' + GlobalValue.host,
          timestamp,
          'chat'
        );
      }

      // d.setUTCSeconds(timestamp);
      const randomId = Math.random();
      const pushMSG = {
        from: '', // "me",
        msg: this.msg,
        align: 'right',
        image_url: '',
        stamp: d.toLocaleString(undefined, {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        id: randomId,
        sendingFailedText: this.isConnected ? true : false
      };
      this.chatService.chats.push(pushMSG);
      this.chatService.chatListAdd(this.chatService.chats);
      // for bind recent history
      const historyMsg = {
        stamp: timestamp,
        user_id: this.sentUser,
        message: pushMSG.msg,
        username: this.selectedGroup.user_name,
        profile_pic: this.selectedGroup.profile_pic,
        group_type: 'friend'
      };
      console.log('from friend com add history');
      this.chatService.AddtoHistory(historyMsg, 'fromSelect_seen');
      // this.callsComponent.ShowHistory();
    }
    this.msg = '';
  }

  sendMSGWithFile(contentType, fileLink, thumbnailLink?, toUserName?) {
    // this.sentUser = this.selectedGroup.user_name + "@" + GlobalValue.host;

    this.sentUser = toUserName + '@' + GlobalValue.host;
    const userStore = JSON.parse(localStorage.getItem('sessionUser'));
    if (this.msg == undefined) {
      this.msg = '';
    }
    console.log(this.chatService.connection);
    // if (this.msg != undefined && this.msg.trim().length > 0) {
    // this._chatService.sendMessage("admin3@ums132.einfochips.com", this.msg);
    const timestamp = new Date().getTime();
    // if(this.chatService.connection != null){
    //   this.chatService.sendMessage(this.sentUser, this.msg.trim(), userStore.user_name + "@" + GlobalValue.host, timestamp, null, contentType, fileLink, thumbnailLink);
    // } else if(this.chatService.connection == null){
    //   this.saveChatDataLocally_When_User_Offline(this.sentUser, this.msg.trim(), userStore.user_name + "@" + GlobalValue.host, timestamp, 'chat', null, contentType, fileLink, thumbnailLink);
    // }
    this.chatService.sendMessage(
      this.sentUser,
      this.msg.trim(),
      userStore.user_name + '@' + GlobalValue.host,
      timestamp,
      null,
      contentType,
      fileLink,
      thumbnailLink
    );
    const d = new Date(timestamp); // The 0 there is the key, which sets the date to the epoch
    // d.setUTCSeconds(timestamp);
    const randomId = Math.random();
    const splitFilename = fileLink.split('/');
    const fileShortName = splitFilename[splitFilename.length - 1];
    if (toUserName === this.selectedGroup.user_name) {
      const pushMSG = {
        from: '', // "me",
        msg: fileLink,
        align: 'right',
        image_url: '',
        stamp: d.toLocaleString(undefined, {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        id: randomId,
        isFile: true,
        fileType: contentType,
        fileShortName: fileShortName,
        thumbnail: thumbnailLink,
        // sendingFailedText : this.isConnected ? true : false,
        sendingFailedText: true
      };
      this.chatService.chats.push(pushMSG);
      this.chatService.chatListAdd(this.chatService.chats);
    }
  }

  sendgroupmessage() {
    const ms = this.msg.trim();
    if (this.chatService.connection != null) {
      this.chatService.connectChatRoom(this.selectedGroup.group_id);
      const res = this.chatService.sendMessageToRoom(this.selectedGroup.group_id + '@conference.' + GlobalValue.host, ms);
    } else if (this.chatService.connection == null) {
      const timestamp = new Date().getTime();
      this.saveChatDataLocally_When_User_Offline(
        this.selectedGroup.group_id + '@conference.' + GlobalValue.host,
        ms,
        null,
        timestamp,
        'groupChat'
      );
      const d = new Date(timestamp); // The 0 there is the key, which sets the date to the epoch
      const randomId = Math.random();
      const pushMSG = {
        from: '', // "me",
        msg: this.msg,
        align: 'right',
        image_url: '',
        stamp: d.toLocaleString(undefined, {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        id: randomId,
        sendingFailed: this.isConnected ? true : false,
        sendingFailedText: this.isConnected ? true : false
      };
      this.chatService.chats.push(pushMSG);
      this.chatService.chatListAdd(this.chatService.chats);
    }
    this.msg = '';
  }

  sendgroupmessageWithFile(fileUrl, contantType, thumbnailLink, toGroup) {
    this.chatService.connectChatRoom(toGroup); // here user_name = groupid
    const ms = fileUrl;
    const res = this.chatService.sendMessageToRoom(toGroup + '@conference.' + GlobalValue.host, ms, contantType, thumbnailLink);
    this.msg = '';
    fileUrl = '';
  }

  saveChatDataLocally_When_User_Offline(to, message, from, timestamp, message_type, callObj?, contentType?, fileLink?, thumbnailLink?) {
    let offlineMessageOnLocalStorage = [];
    offlineMessageOnLocalStorage = JSON.parse(localStorage.getItem('offline_message'));
    const currentOfflineMessage = {
      to: to,
      from: from,
      message: message,
      timestamp: timestamp,
      message_type: message_type
      // callObj : callObj,
      // contentType : contentType,
      // fileLink : fileLink,
      // thumbnailLink : thumbnailLink
    };
    offlineMessageOnLocalStorage.push(currentOfflineMessage);
    localStorage.setItem('offline_message', JSON.stringify(offlineMessageOnLocalStorage));
    console.log('save offline msg locally');
  }

  retry() {
    const user = JSON.parse(localStorage.getItem('sessionUser'));
    const data = { user_name: user.user_name, password: user.password };
    this.chatService.checkConnection(data);
  }

  selectUser(roleName) {
    this.roleName = roleName;
  }

  selectchatuser(e) {
    this.cssdisplay = 'display;';
    this.chatService.chatProgressListner.next(true);
    this.chatService.pageNo = 1;
    if (e == null) {
      return false;
    }
    if (e.isgroup) {
      this.chatService.chats = [];
      this.chatService.chatListAdd(this.chatService.chats);
      this.selectedGroup.isgroup = true;
      this.selectedGroup.user_name = e.group_name;
      this.selectedGroup.user_id = e.group_id;
      this.selectedGroup.group_id = e.group_id;
      this.chatService.connectChatRoom(e.group_id);
      // this.chatService.ClearUnread(e.group_id + "@conference.alertcircle.com", e.id);
      this.chatService.ClearUnread(e.group_id + '@conference.' + GlobalValue.host);

      this.chatService.getConferanceMessages(e.group_id + '@conference.' + GlobalValue.host, this.chatService.pageNo).subscribe(
        (result) => {
          const r = result.resultset;
          this.chatService.chatProgressListner.next(false);
          if (r.length <= 0 || r.length <= 99) {
            this.chatService.chatLoadMoreButton$.next(false);
          } else {
            this.chatService.chatLoadMoreButton$.next(true);
          }

          // r.sort(function (z, y) {
          //   return z.timestamp - y.timestamp;
          // });
          r.forEach((element) => {
            //  var forwarded = element.xml.toString().getElementsByTagName('forwarded');
            element.getDataFromService = true; // this flag will track that, this data comes from rest api.
            this.chatService.conMessageParse(element);
            this.isProgress = false;
          });
        },
        (err) => {
          this.isProgress = false;
          this.chatService.chatProgressListner.next(false)
        }
      );
    } else {
      const groupInfo = {
        is_active: true
      };
      // this.groupService.groupInfo(groupInfo);
      this.chatService.chats = [];
      this.chatService.chatListAdd(this.chatService.chats);
      this.chatService.ClearUnread(e.user_name + '@' + GlobalValue.host);

      this.chatService.getMessages(e.user_name + '@' + GlobalValue.host, this.chatService.pageNo).subscribe(
        (result) => {
          const r = result.resultset;
          this.chatService.chatProgressListner.next(false);
          // r.sort(function(z, y){
          //   return z.timestamp-y.timestamp;
          //  });
          this.cssdisplay = 'display;';
          if (r.length === 0 || r.length <= 99) {
            this.chatService.chatLoadMoreButton$.next(false);
          } else {
            this.chatService.chatLoadMoreButton$.next(true);
          }
          if (r == null) {
            return;
          }
          r.forEach((element) => {
            //  var forwarded = element.xml.toString().getElementsByTagName('forwarded');
            this.chatService.messageParse(element);
          });
        },
        (err) => this.chatService.chatProgressListner.next(false)
      );
    }
  }

  composing(event) {
    if (event.type === 'keypress') {
      // this.isAttachMentOpen = false
      $('#fileUpload').hide(500);
    }
    this.chatService.onSelectedGroup$.subscribe((group) => {
      this.selectedGroup = group;
    });
    // if (this.selectedGroup.isgroup) {
    // 	var chat = { user_name: this.selectedGroup.group_id + '@conference.' + GlobalValue.host, status: 'composing', isgroup: true };
    // 	this.chatService.sendChatStatus(chat);
    // } else {
    // 	var chat = { user_name: this.selectedGroup.user_name + '@' + GlobalValue.host, status: 'composing', isgroup: false };
    // 	this.chatService.sendChatStatus(chat);
    // }
  }

  composingOut(event) {
    $('#fileUpload').hide(500); // to toggol file picker
    this.chatService.onSelectedGroup$.subscribe((group) => {
      this.selectedGroup = group;
    });
    // if (this.selectedGroup.isgroup) {
    // 	var chat = { user_name: this.selectedGroup.group_id + '@conference.' + GlobalValue.host, status: 'paused', isgroup: true };
    // 	this.chatService.sendChatStatus(chat);
    // } else {
    // 	var chat = { user_name: this.selectedGroup.user_name + '@' + GlobalValue.host, status: 'paused', isgroup: false };
    // 	this.chatService.sendChatStatus(chat);
    // }
  }

  loadMoreChat() {
    this.chatService.pageNo = this.chatService.pageNo + 1;
    this.chatService.getMessages(this.selectedGroup.user_name + '@' + GlobalValue.host, this.chatService.pageNo).subscribe((result) => {
      const r = result.resultset;
      // r.sort(function(z, y){
      //   return z.timestamp-y.timestamp;
      //  });
      if (r == null) {
        return;
      }
      if (r.length <= 0 || r.length <= 99) {
        this.chatService.chatLoadMoreButton$.next(false);
      } else {
        this.chatService.chatLoadMoreButton$.next(true);
      }
      r.forEach((element) => {
        //  var forwarded = element.xml.toString().getElementsByTagName('forwarded');
        this.chatService.messageParse(element);
      });
    });

    let topMsgPossition: any;
    for (let i = this.chatlist.length - 1; i >= 0; i--) {
      topMsgPossition = document.getElementById(this.chatlist[i].id);
    }
    if (topMsgPossition) {
      topMsgPossition.scrollIntoView();
    }
  }

  fileTypeOpen() {
    // if(!this.uploadProgress){
    const e: any = $('#fileUpload');

    const x = document.getElementById('callChat');
    if (x) {
      if (x.querySelector('#fileUpload')) {
        // x.querySelector("#fileUpload").classList.toggle("show");
        // x.querySelector("#fileUpload").classList.toggle("hideCallViewFileupload");
        // var none = document.getElementById("fileUpload").style.display == "none";
        // var block = document.getElementById("fileUpload").style.display == "block";
        // if(document.getElementById("fileUpload").style.display == "none")
        // {
        //   x.querySelector("#fileUpload").setAttribute("style","display:block !important;display: flex;    position: absolute;top: -33px;left: 40px;")
        // } else {
        //   x.querySelector("#fileUpload").setAttribute("style","display:none !important;display: flex;    position: absolute;top: -33px;left: 40px;")
        // }
      }
    } else {
      $('#fileUpload').toggle(500);
    }
  }

  getFiles(e) {
    // document.getElementById('attachment').click();
    const filesArray = e.target.files;
    uploadingFileQueue = [];
    if (filesArray.length > 0) {
      for (let i = 0; i < filesArray.length; i++) {
        this.uploadProgress = true;
        let fileType = filesArray[i].type.substring(0, filesArray[i].type.indexOf('/'));
        let fileUploadIdentifiedId;
        if (fileType == 'application') {
          fileType = 'file';
        }
        // =================================

        const randomId = Math.floor(Math.random() * 100);
        fileUploadIdentifiedId = 'randomId_' + filesArray[i].lastModified + randomId;
        filesArray[i].fileUploadIdentifiedId = fileUploadIdentifiedId;

        const toUser = {
          user_name: this.selectedGroup.isgroup == true ? this.selectedGroup.user_id : this.selectedGroup.user_name,
          user_id: this.selectedGroup.user_id
        };

        const reader = new FileReader();
        reader.onload = (e: any) => {
          const timestamp = new Date().getTime();
          const d = new Date(timestamp);
          const pushMSG = {
            from: '', // "me",
            msg: e.target.result,
            align: 'right',
            image_url: '',
            stamp: d.toLocaleString(undefined, {
              day: 'numeric',
              month: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            thumbnail: e.target.result,
            isFile: true,
            fileType: fileType,
            id: filesArray[i].fileUploadIdentifiedId,
            isLoader: true,
            fileShortName: filesArray[i].name,
            // sendingFailedText : this.isConnected ? true : false,
            sendingFailedText: true
          };
          this.chatService.chats.push(pushMSG);
          this.chatService.chatListAdd(this.chatService.chats);
          this.onChange.emit(filesArray[i]);

          const currentUploadFiledata = {
            toUser: this.selectedGroup.user_name,
            fileType: fileType,
            fileId: fileUploadIdentifiedId,
            fileData: {
              lastModified: filesArray[i].lastModified,
              lastModifiedDate: filesArray[i].lastModifiedDate,
              name: filesArray[i].name,
              size: filesArray[i].size,
              type: filesArray[i].type
            }
          };

          // push uploading queue data
          // uploadingFileQueue.push(currentUploadFiledata);
          // console.log(uploadingFileQueue)
          // localStorage.setItem("uploadingFileQueue", JSON.stringify(uploadingFileQueue))
        };
        reader.readAsDataURL(filesArray[i]);

        // =================================
        // upload file from here
        if (fileType) {
          // for new upload process (Http/Https)
          this.chatService.audioVideoUpload(filesArray[i], fileUploadIdentifiedId, toUser).subscribe(
            (result) => {
              if (result.status == 'ok') {
                if (document.getElementById('callChat')) {
                  // this is for on call chat window.
                  const x = document.getElementById('callChat');
                  let uploadFileFind: any;
                  const randomId = result.result.uploading_file_id.toString();
                  uploadFileFind = x.querySelector('#' + randomId); // find uploaded preview and display none
                  console.log(result.result.uploading_file_id + '-' + uploadFileFind);
                  if (uploadFileFind) {
                    uploadFileFind.style.display = 'none';
                  }
                }

                let uploadFileFind: any;
                uploadFileFind = document.getElementById('' + result.result.uploading_file_id); // find uploaded preview and display none
                console.log(result.result.uploading_file_id + '-' + uploadFileFind);
                if (uploadFileFind) {
                  uploadFileFind.style.display = 'none';
                }

                if (this.selectedGroup.isgroup) {
                  this.sendgroupmessageWithFile(
                    result.result.url,
                    fileType,
                    result.result.thumbnail,
                    result.result.toUser.user_name
                  );
                } else {
                  this.sendMSGWithFile(
                    fileType,
                    result.result.url,
                    result.result.thumbnail,
                    result.result.toUser.user_name
                  );
                }
              }
            },
            (err) => {
              console.log('from new upload method', err);
              if (document.getElementById('callChat')) {
                // this is for on call chat window.
                const x = document.getElementById('callChat');
                let uploadFileFind: any;
                const randomId = fileUploadIdentifiedId.toString();
                uploadFileFind = x.querySelector('#' + randomId); // find uploaded preview and display none
                if (uploadFileFind) {
                  uploadFileFind.style.display = 'none';
                }
              }
              let uploadFileFind: any;
              uploadFileFind = document.getElementById('' + fileUploadIdentifiedId); // find uploaded preview and display none
              if (uploadFileFind) {
                uploadFileFind.style.display = 'none';
              }
              Swal.fire('Warning', (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'আপলোড সফল হয়নি, অনুগ্রহপূর্বক আবার চেষ্টা করুন' : 'Uploading failed, Please try again', 'warning');
            }
          );
        } else {
          // for Old Upload process (Slot request with Xammp) , only image and file
          Swal.fire('Warning', (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'এই ফাইল এর সাপোর্ট নেই' : 'File are not supported yet.', 'warning');

          // var fileUploadResult = defer(() => this.uploadPlugin.upload(filesArray[i], fileUploadIdentifiedId, toUser, fileType ));
          // fileUploadResult.subscribe(result => {

          //   console.log(result);
          //   if (fileType == 'image') {
          //     var xml = result.thumbnail_link;
          //     var parser = new DOMParser();
          //     var xmlDoc = parser.parseFromString(xml, "text/xml");
          //     var thumbnail = xmlDoc.getElementsByTagName('thumbnail')[0];
          //     var thumbnail_link = thumbnail.getAttribute('uri');
          //   }
          //   var splitFilename = result.original_link.split('/');
          //   var fileShortName = splitFilename[splitFilename.length - 1];

          //   var uploadFileFind = document.getElementById("" + result.uploading_file_id); // find uploaded preview and display none
          //   console.log(result.uploading_file_id + "-" + uploadFileFind)
          //   if (uploadFileFind) {
          //     uploadFileFind.style.display = "none";
          //   }

          //   // clear localStorage
          //   // var uploadingFileQueueListFromLocalStore = [];
          //   // uploadingFileQueueListFromLocalStore = JSON.parse(localStorage.getItem('uploadingFileQueue'));
          //   // localStorage.removeItem('uploadingFileQueue');
          //   // let obj = uploadingFileQueueListFromLocalStore.find(x => x.fileId == result.uploading_file_id)
          //   // if (obj) {
          //   //   let index = uploadingFileQueueListFromLocalStore.indexOf(obj);
          //   //   uploadingFileQueueListFromLocalStore.splice(index, 1);
          //   // }
          //   // localStorage.setItem("uploadingFileQueue", JSON.stringify(uploadingFileQueueListFromLocalStore))

          //   this.sendMSGWithFile(fileType, result.original_link, thumbnail_link, result.toUser.user_name);

          //   console.log(result);
          //   // for clear selection file.
          //   if (filesArray.length == i + 1) {
          //     this.uploadProgress = false;
          //     e.target.value = '';
          //   }
          // }, err => {
          //   // this.uploadProgress = false;
          //   // Swal({
          //   //   title: "Upload failed, Please check your internet connection",
          //   //   type: 'warning'
          //   // });
          //   Swal({
          //     title: "Photo and Document are not uploading yet, this feature is coming soon",
          //     type: 'warning'
          //   });
          // })
        }

        //
      }
    }
  }

  _handleTextAreaSize(field) {
    field.style.height = 'inherit';
    var computed = window.getComputedStyle(field);
    var height = parseInt(computed.getPropertyValue('border-top-width'), 10)
      + parseInt(computed.getPropertyValue('padding-top'), 10)
      + field.scrollHeight
      + parseInt(computed.getPropertyValue('padding-bottom'), 10)
      + parseInt(computed.getPropertyValue('border-bottom-width'), 10);
    field.style.height = height + 'px';
  }

  projectImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.profile_pic = e.target.result;
      this.onChange.emit(file);
    };
    reader.readAsDataURL(file);
  }

  imageViewer(imgLink) {
    this.imageLink = null;
    this.imageLink = imgLink;

    const modal = document.getElementById('imageViewModal');
    const toolbar_header = $('.toolbar_header').height();
    const room_controller = $('#room-controller').height(); // footer part
    const windowHeight = window.innerHeight;
    const middleHeight = windowHeight - (toolbar_header + room_controller);
    $('.popUpImageModal').css('height', middleHeight);
    if (modal) {
      $('#imageViewModal').show(500);
      // $('.headerTopLeft').css('z-index', '1');
    }
  }

  closeImage() {
    this.imageLink = null;
    if (document.getElementById('callChat')) {
      // this is for on call chat window.
      let modal: any;
      const x = document.getElementById('callChat');
      modal = x.querySelector('#imageViewModal');
      const sideTab = document.getElementById('sideTab');
      if (modal) {
        $('.headerTopLeft').css('z-index', '1000');
        modal.style.display = 'none';
        sideTab.style.display = 'block';
      }
    } else {
      const modal = document.getElementById('imageViewModal');
      const sideTab = document.getElementById('sideTab');
      if (modal) {
        // $('.headerTopLeft').css('z-index', '1000');
        modal.style.display = 'none';
        // sideTab.style.display = 'block';
      }
    }
  }

  editChat(chatData) {
    this.msg = chatData.msg;
    document.getElementById('msgInput').focus();
  }

  dragOver(ev) {
    ev.preventDefault();
    let chatTextAreaElement: any;
    chatTextAreaElement = document.getElementById('sendInput');
    chatTextAreaElement.style.backgroundColor = '#999';

    // placeholder
    let msgInputElement: any;
    msgInputElement = document.getElementById('msgInput');
    msgInputElement.classList.add('placeholderwhite');
    msgInputElement.placeholder = (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'এখানে আপনার ফাইল ড্রপ করুন' : 'Drop your file here ... ';
  }

  dragLeave(ev) {
    ev.preventDefault();
    let chatTextAreaElement: any;
    chatTextAreaElement = document.getElementById('sendInput');
    chatTextAreaElement.style.backgroundColor = 'white';

    // placeholder
    let msgInputElement: any;
    msgInputElement = document.getElementById('msgInput');
    msgInputElement.classList.remove('placeholderwhite');
    msgInputElement.placeholder = (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'এখানে লিখুন' : 'Write here ... ';
  }

  drag(ev) {
    // Code here
  }

  drop(ev) {
    ev.preventDefault();
    const dragedFileList = {
      target: ev.dataTransfer // array of file.
    };

    this.getFiles(dragedFileList);

    let chatTextAreaElement: any;
    chatTextAreaElement = document.getElementById('sendInput');
    chatTextAreaElement.style.backgroundColor = 'white';

    // placeholder
    let msgInputElement: any;
    msgInputElement = document.getElementById('msgInput');
    msgInputElement.classList.remove('placeholderwhite');
    msgInputElement.placeholder = (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'এখানে লিখুন' : 'Write here ... ';
  }
  closeSideNav() {
    this.globalService.callScreenSideNavShowData$.next('close');
    this.openViduChatService.toggleChat();
  }

  playSound(filename?) {
		const mp3Source = '<source src="../../assets/sound/notification.mp3" type="audio/mpeg">';
		const oggSource = '<source src="../../assets/sound/notification.ogg" type="audio/ogg">';
		const embedSource = '<embed hidden="true" autostart="true" loop="false" src="../../assets/sound/notification.mp3">';
		document.getElementById('sound').innerHTML = '<audio autoplay="autoplay">' + mp3Source + oggSource + embedSource + '</audio>';
	  }
}
