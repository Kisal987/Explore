import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';


@Component({
  selector: 'app-groupsearch',
  templateUrl: './groupsearch.component.html',
  styleUrls: ['./groupsearch.component.css']
})
export class GroupsearchComponent implements OnInit {

  @ViewChild('myDrop', { static: true }) searchDrop;

  searchterm;
  users;
  groups;

  hide = false;

  startAt = new Subject();
  endAt = new Subject();

  startObs = this.startAt.asObservable();
  endAtObs = this.endAt.asObservable();

  constructor(
    private afs: AngularFirestore,
    private router: Router,
  ) { }

  ngOnInit() {
    this.router.routeReuseStrategy.shouldReuseRoute = function() {
      return false;
    };
    Observable.combineLatest(this.startObs, this.endAtObs).subscribe(
      value => {
        this.doQuery(value[0], value[1]).subscribe(
          users => {
            if (users) {
              this.users = users;
              this.searchDrop.open();
            }
          });
          this.doGroupQuery(value[0], value[1]).subscribe(
            groups => {
              if (groups) {
                this.groups = groups;
              }
            });
      });
  }

  doQuery(start, end) {
    return this.afs.collection('users', ref => ref.limit(3).orderBy('userName').startAt(start).endAt(end)).valueChanges();
  }

  doGroupQuery(start, end) {
    return this.afs.collection('groups', ref => ref.limit(3).orderBy('gname').startAt(start).endAt(end)).valueChanges();
  }

  search($event) {
    const q = $event.target.value;
    this.startAt.next(q);
    this.endAt.next(q + '\uf8ff');
  }

  sendToProfile(username) {
    this.searchterm = null;
    this.router.navigateByUrl('user/' + username);
  }
  async sendRequest(username,uid){
    let isuser=false;
    var gid=localStorage.getItem("gid");
    await this.afs.collection("groups").doc(gid.toString()).collection('/members', ref => ref.where('uid', '==', uid)).valueChanges().subscribe(val=>{
      if(val){
         isuser=true;
         
      }
    });
    
     if(!isuser){
      
      this.afs.collection("groups").doc(gid.toString()).collection("members").doc(uid).set(
       {
        uid : uid,
        date : new Date()
       }

      );}
    console.log(username);
    console.log(uid);
    localStorage.getItem("gid");
  
  }
}
