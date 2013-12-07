# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Conference'
        db.create_table(u'wakeup_conference', (
            ('conferenceid', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('maxcapacity', self.gf('django.db.models.fields.IntegerField')()),
            ('datecreated', self.gf('django.db.models.fields.DateTimeField')()),
        ))
        db.send_create_signal(u'wakeup', ['Conference'])

        # Adding model 'Call'
        db.create_table(u'wakeup_call', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('conference', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['wakeup.Conference'], null=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['auth.User'])),
            ('callduration', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('recording', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['wakeup.Recording'], null=True)),
            ('snoozed', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('answered', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('matched', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('completed', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('errorcode', self.gf('django.db.models.fields.CharField')(default='', max_length=5, blank=True)),
            ('rated', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('rating', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('retries', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('datecreated', self.gf('django.db.models.fields.DateTimeField')()),
        ))
        db.send_create_signal(u'wakeup', ['Call'])

        # Adding model 'Recording'
        db.create_table(u'wakeup_recording', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('recordingurl', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('recordingduration', self.gf('django.db.models.fields.IntegerField')(default=0, null=True)),
            ('privacy', self.gf('django.db.models.fields.CharField')(default='P', max_length=1)),
            ('plays', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('rating', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('warnings', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('datecreated', self.gf('django.db.models.fields.DateTimeField')()),
        ))
        db.send_create_signal(u'wakeup', ['Recording'])

        # Adding model 'RecordingRating'
        db.create_table(u'wakeup_recordingrating', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('recording', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['wakeup.Recording'])),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['auth.User'])),
            ('rated', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('lastplayed', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('reported', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('datecreated', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal(u'wakeup', ['RecordingRating'])

        # Adding model 'RecordingComment'
        db.create_table(u'wakeup_recordingcomment', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('recording', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['wakeup.Recording'])),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['auth.User'])),
            ('comment', self.gf('django.db.models.fields.CharField')(max_length=300)),
        ))
        db.send_create_signal(u'wakeup', ['RecordingComment'])


    def backwards(self, orm):
        # Deleting model 'Conference'
        db.delete_table(u'wakeup_conference')

        # Deleting model 'Call'
        db.delete_table(u'wakeup_call')

        # Deleting model 'Recording'
        db.delete_table(u'wakeup_recording')

        # Deleting model 'RecordingRating'
        db.delete_table(u'wakeup_recordingrating')

        # Deleting model 'RecordingComment'
        db.delete_table(u'wakeup_recordingcomment')


    models = {
        u'auth.group': {
            'Meta': {'object_name': 'Group'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        u'auth.permission': {
            'Meta': {'ordering': "(u'content_type__app_label', u'content_type__model', u'codename')", 'unique_together': "((u'content_type', u'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['contenttypes.ContentType']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        u'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        u'wakeup.call': {
            'Meta': {'object_name': 'Call'},
            'answered': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'callduration': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'completed': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'conference': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['wakeup.Conference']", 'null': 'True'}),
            'datecreated': ('django.db.models.fields.DateTimeField', [], {}),
            'errorcode': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '5', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'matched': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'rated': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'rating': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'recording': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['wakeup.Recording']", 'null': 'True'}),
            'retries': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'snoozed': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']"})
        },
        u'wakeup.conference': {
            'Meta': {'object_name': 'Conference'},
            'conferenceid': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'datecreated': ('django.db.models.fields.DateTimeField', [], {}),
            'maxcapacity': ('django.db.models.fields.IntegerField', [], {})
        },
        u'wakeup.recording': {
            'Meta': {'object_name': 'Recording'},
            'datecreated': ('django.db.models.fields.DateTimeField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'plays': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'privacy': ('django.db.models.fields.CharField', [], {'default': "'P'", 'max_length': '1'}),
            'rating': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'recordingduration': ('django.db.models.fields.IntegerField', [], {'default': '0', 'null': 'True'}),
            'recordingurl': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'warnings': ('django.db.models.fields.IntegerField', [], {'default': '0'})
        },
        u'wakeup.recordingcomment': {
            'Meta': {'object_name': 'RecordingComment'},
            'comment': ('django.db.models.fields.CharField', [], {'max_length': '300'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'recording': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['wakeup.Recording']"}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']"})
        },
        u'wakeup.recordingrating': {
            'Meta': {'object_name': 'RecordingRating'},
            'datecreated': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'lastplayed': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'rated': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'recording': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['wakeup.Recording']"}),
            'reported': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']"})
        }
    }

    complete_apps = ['wakeup']