import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Usuarios } from 'src/app/shared/models/usuarios.model';
import { UsuariosService } from 'src/app/shared/services/usuarios.service';
import { UsuariosForm } from 'src/app/shared/formsModels/usuariosForms'; 
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-admin-usuarios',
  templateUrl: './admin-usuarios.component.html',
  styleUrls: ['./admin-usuarios.component.scss']
})
export class AdminUsuariosComponent implements OnInit {
  usuarioForm: UsuariosForm;
  titulo = '';
  isCreate = true;

  constructor(
    public dialogRef: MatDialogRef<AdminUsuariosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { usuario: Usuarios },
    private srvUsuarios: UsuariosService,
    private fb: FormBuilder  // FormBuilder inyectado aquí
  ) {
    this.usuarioForm = new UsuariosForm(fb);  // y aquí lo usamos
  }

  ngOnInit(): void {
    if (this.data && this.data.usuario) {
      this.titulo = 'Modificar Usuario';
      this.isCreate = false;
      this.usuarioForm.baseForm.patchValue(this.data.usuario);
    } else {
      this.titulo = 'Crear Usuario';
      this.isCreate = true;
    }
  }

  guardar(): void {
    console.log('Formulario válido:', this.usuarioForm.baseForm.valid);
    if (this.usuarioForm.baseForm.valid) {
      if (this.isCreate) {
        this.srvUsuarios.guardar(this.usuarioForm.baseForm.value).subscribe(
          res => {
            alert('Se creó el usuario');
            this.dialogRef.close(res);
          },
          err => {
            console.log('Error al crear el usuario:', err);
            if (err.error && err.error.mensaje === 'El usuario ya existe') {
              alert('El usuario ya existe. Por favor, ingresa un ID diferente.');
            } else {
              alert('Hubo un error al crear el usuario. Por favor, revisa bien la información de los campos');
            }
          }
        );
      } else {
        console.log('Modificando usuario...');
        if (this.usuarioForm.baseForm.controls) {
          // Creamos un objeto con solo los campos que se modificaron
          const updatedFields: { [key: string]: any } = Object.keys(this.usuarioForm.baseForm.controls)
            .filter(key => this.usuarioForm.baseForm.get(key)?.dirty)
            .reduce((obj: { [key: string]: any }, key) => {
              const value = this.usuarioForm.baseForm.get(key)?.value;
              if (value) obj[key] = value;
              return obj;
            }, {});
          
          const cedula = this.usuarioForm.baseForm.get('cedula')?.value;
  
          // Creamos un objeto del tipo Usuarios con los campos actualizados
          const usuarioModificado = { ...this.data.usuario, ...updatedFields, cedula };
  
          this.srvUsuarios.modificar(usuarioModificado as Usuarios).subscribe(
            res => {
              alert('Modificado correctamente');
              this.dialogRef.close(res);
            },
            err => {
              console.log('Error al modificar el usuario:', err);
            }
          );
        }
      }
    } else {
      alert('Formulario no válido, revisa los campos en rojo');
    }
  }
  
}
