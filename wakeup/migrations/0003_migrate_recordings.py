# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import DataMigration
from django.db import models

class Migration(DataMigration):

    def forwards(self, orm):

        for rec in orm.Recording.objects.all():
            call = rec.call
            call.rec = rec
            call.save()

        evaluated = set()

        for call in orm.Call.objects.all():
            # Check if we have evaluated it
            if call in evaluated:
                continue

            try:
                other = call.conference.call_set.exclude(pk=call.pk)[0]

                recording = call.recording
                otherRecording = other.recording

                if not call.user.profile.is_contact(other.user):
                    # They are not contacts so we don't need to merge the recording objects
                    evaluated.add(call)
                    continue

                if not recording and not otherRecording:
                    # We don't do anything as there are no recordings stored
                    evaluated.add(call)
                    continue

                if recording.recordingduration == 0 and otherRecording.recordingduration == 0:
                    # We don't do anything as recordings have no length
                    evaluated.add(call)
                    continue

                if not recording.recordingurl and not otherRecording.recordingurl:
                    # We don't do anything as recordings have no length
                    evaluated.add(call)
                    continue

                chosen = recording
                # We assign the recording with the shortest duration
                if recording.recordingduration > otherRecording.recordingduration:
                    chosen = otherRecording

                call.rec = recording
                other.rec = recording

                call.save()
                other.save()

                evaluated.add(call)
                evaluated.add(other)


                print recording, otherRecording

            except Exception, err:
                # Does not have an 'other', so we don't need to consider it
                # Exceptions can be because it is referencing a NoneType, or because there is an index out of range
                pass

            evaluated.add(call)

    def backwards(self, orm):
        raise RuntimeError("Cannot reverse this migration. Sorry bro.")

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
            'rec': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'related_call'", 'null': 'True', 'to': u"orm['wakeup.Recording']"}),
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
            'call': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['wakeup.Call']", 'unique': 'True', 'null': 'True'}),
            'chosen': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'datecreated': ('django.db.models.fields.DateTimeField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'other': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['wakeup.Recording']", 'unique': 'True', 'null': 'True'}),
            'plays': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'privacy': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'rating': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'recordingduration': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'recordingurl': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'shared': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
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
    symmetrical = True
