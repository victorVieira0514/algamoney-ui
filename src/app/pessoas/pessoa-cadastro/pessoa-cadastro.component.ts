import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { ToastyService } from 'ng2-toasty';

import { Pessoa } from 'app/core/model';
import { PessoaService } from '../pessoa.service';
import { ErrorHandlerService } from 'app/core/error-handler.service';

@Component({
  selector: 'app-pessoa-cadastro',
  templateUrl: './pessoa-cadastro.component.html',
  styleUrls: ['./pessoa-cadastro.component.css']
})
export class PessoaCadastroComponent implements OnInit {

  pessoa = new Pessoa();

  constructor(
    private pessoaService: PessoaService,
    private toasty: ToastyService,
    private errorHandler: ErrorHandlerService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title
  ) { }

  ngOnInit() {
    const codigoAtual = this.route.snapshot.params['codigo'];

    this.title.setTitle('Nova Pessoa');

    if(codigoAtual) {
      this.carregarPessoaAtual(codigoAtual);
    }
  }
  
  get editando() {
    return Boolean(this.route.snapshot.params['codigo']);
  }

  carregarPessoaAtual(codigo: number) {
    this.pessoaService.buscarPorCodigo(codigo)
      .then(pessoaCarregada => {
        this.pessoa = pessoaCarregada;
        this.atualizarTituloEdicao();
      });
  }
  
  salvar(form: FormControl) {
    if(this.editando) {
      this.atualizarPessoa(form);
    } else {
      this.adicionarPessoa(form);
    }
  }

  atualizarPessoa(form: FormControl) {
    this.pessoaService.atualizar(this.pessoa)
      .then(pessoaAtualizada => {
        this.pessoa = pessoaAtualizada;

        this.toasty.success('Pessoa alterada com sucesso!');
        this.atualizarTituloEdicao();
      })
      .catch(erro => this.errorHandler.handle(erro));
  }

  adicionarPessoa(form: FormControl) {
    this.pessoaService.adicionar(this.pessoa)
      .then(pessoaAdicionada => {
        this.toasty.success('Pessoa adicionada com sucesso!');

        this.router.navigate(['/pessoas', pessoaAdicionada.codigo]);
      })
      .catch(erro => this.errorHandler.handle(erro));
  }
    
  atualizarTituloEdicao(){
    this.title.setTitle(`Edição de pessoa: ${this.pessoa.nome}`);
  }

  nova(form: FormControl) {
    form.reset();

    setTimeout(function() {
      this.pessoa = new Pessoa();
    }.bind(this), 1);

    this.router.navigate(['/pessoas/nova']);
  }

}
