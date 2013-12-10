# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Contact'
        db.create_table(u'accounts_contact', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(related_name='contacts', to=orm['auth.User'])),
            ('contact', self.gf('django.db.models.fields.related.ForeignKey')(related_name='to_contacts', to=orm['auth.User'])),
            ('status', self.gf('django.db.models.fields.CharField')(default='P', max_length=1)),
            ('type', self.gf('django.db.models.fields.CharField')(default='A', max_length=1)),
            ('datecreated', self.gf('django.db.models.fields.DateField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal(u'accounts', ['Contact'])

        # Adding model 'UserProfile'
        db.create_table(u'accounts_userprofile', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('mugshot', self.gf('django.db.models.fields.files.ImageField')(max_length=100, blank=True)),
            ('privacy', self.gf('django.db.models.fields.CharField')(default='closed', max_length=15)),
            ('user', self.gf('django.db.models.fields.related.OneToOneField')(related_name='profile', unique=True, to=orm['auth.User'])),
            ('alarm', self.gf('django.db.models.fields.TimeField')(default=datetime.time(8, 0))),
            ('dob', self.gf('django.db.models.fields.DateField')(null=True, blank=True)),
            ('membership', self.gf('django.db.models.fields.CharField')(default='F', max_length=1)),
            ('roomdesired', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('recording', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('alarmon', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('snoozelimit', self.gf('django.db.models.fields.IntegerField')(default=3)),
            ('warnings', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('phone', self.gf('django.db.models.fields.CharField')(unique=True, max_length=20)),
            ('reputation', self.gf('django.db.models.fields.IntegerField')(default=0, null=True, blank=True)),
            ('gender', self.gf('django.db.models.fields.CharField')(max_length=1)),
            ('femalematch', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('malematch', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('any_match', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('activated', self.gf('django.db.models.fields.BooleanField')(default=False)),
        ))
        db.send_create_signal(u'accounts', ['UserProfile'])

        # Adding model 'MessageVerification'
        db.create_table(u'accounts_messageverification', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['auth.User'], unique=True)),
            ('code', self.gf('django.db.models.fields.CharField')(max_length=4)),
            ('verified', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('time_sent', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('time_verified', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
        ))
        db.send_create_signal(u'accounts', ['MessageVerification'])


    def backwards(self, orm):
        # Deleting model 'Contact'
        db.delete_table(u'accounts_contact')

        # Deleting model 'UserProfile'
        db.delete_table(u'accounts_userprofile')

        # Deleting model 'MessageVerification'
        db.delete_table(u'accounts_messageverification')


    models = {
        u'accounts.contact': {
            'Meta': {'object_name': 'Contact'},
            'contact': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'to_contacts'", 'to': u"orm['auth.User']"}),
            'datecreated': ('django.db.models.fields.DateField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'status': ('django.db.models.fields.CharField', [], {'default': "'P'", 'max_length': '1'}),
            'type': ('django.db.models.fields.CharField', [], {'default': "'A'", 'max_length': '1'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'contacts'", 'to': u"orm['auth.User']"})
        },
        u'accounts.messageverification': {
            'Meta': {'object_name': 'MessageVerification'},
            'code': ('django.db.models.fields.CharField', [], {'max_length': '4'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'time_sent': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'time_verified': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['auth.User']", 'unique': 'True'}),
            'verified': ('django.db.models.fields.BooleanField', [], {'default': 'False'})
        },
        u'accounts.userprofile': {
            'Meta': {'object_name': 'UserProfile'},
            'activated': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'alarm': ('django.db.models.fields.TimeField', [], {'default': 'datetime.time(8, 0)'}),
            'alarmon': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'any_match': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'dob': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'femalematch': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'gender': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'malematch': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'membership': ('django.db.models.fields.CharField', [], {'default': "'F'", 'max_length': '1'}),
            'mugshot': ('django.db.models.fields.files.ImageField', [], {'max_length': '100', 'blank': 'True'}),
            'phone': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '20'}),
            'privacy': ('django.db.models.fields.CharField', [], {'default': "'closed'", 'max_length': '15'}),
            'recording': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'reputation': ('django.db.models.fields.IntegerField', [], {'default': '0', 'null': 'True', 'blank': 'True'}),
            'roomdesired': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'snoozelimit': ('django.db.models.fields.IntegerField', [], {'default': '3'}),
            'user': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'profile'", 'unique': 'True', 'to': u"orm['auth.User']"}),
            'warnings': ('django.db.models.fields.IntegerField', [], {'default': '0'})
        },
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
        }
    }

    complete_apps = ['accounts']