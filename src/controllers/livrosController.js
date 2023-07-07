import NaoEncontrado from "../erros/NaoEncontrado.js";


import { autores, livros } from "../models/index.js";


class LivroController{

  static listarLivros = async(req, res, next) => {

    try {

      const buscaLivros = livros.find();

      
      req.resultado = buscaLivros;

      next();
      
        
    } catch (erro) {
      next(erro);
    }
  };

  static listarLivrosPorFiltro = async (req, res, next) => {

    try {
  
      const busca = await processaBusca(req.query);

      if(busca !== null){
        const livrosResultado = livros
        .find(busca)
        .populate("autor");

        req.resultado = livrosResultado;
          
       next();
        
      }else{
        res.status(200).send([]);
      }
      
    } catch (erro) {
      next(erro);
    }
  };

  static listarLivrosPorId = async (req, res, next) => {
    try {
        const id = req.params.id;
        const livroResultado = await livros
        .findById(id, {}, {autopopulate:false})
        .populate("autor","nome")
                       
          .exec();
      if(livroResultado !== null){  
        res.status(200).send(livroResultado);

      }else{
        next(new NaoEncontrado( "Id do livros não localiazdo."));
      }
    
    } catch (erro) {
      next(erro);
    
    }

  };
  
  
  static cadastrarLivro = async (req, res, next) => {
    try {
      let livro = new livros(req.body);

      const livroResultado = await livro.save();

      res.status(201).send(livroResultado.toJSON());
    } catch (erro) {
      next(erro);
    }
  };


  static atualizarLivro = async (req, res, next) => {
    try {
      const id = req.params.id;
      const livrosResultado = await livros.findByIdAndUpdate( id, {$set: req.body});
      if(livrosResultado !== null){
        res.status(200).send({message: "Livro atualizado com sucesso"});
      }else {
        next(new NaoEncontrado( "Id do livros não localiazdo."));
      }
    } catch (erro) {
      next(erro);
    }

  };

  static excluirLivro = async(req, res, next) => {
    try {
      const id = req.params.id;

      const livroResultado = await livros.findByIdAndDelete(id);

      if(livroResultado !== null){
        res.status(200).send({message: "Livro removido com sucesso"});
      }else{
        next(new NaoEncontrado("Id do livro não foi localizado"))
      }

      
    } catch (erro) {
      next(erro);
    } 
    
  };
   

}

 async function processaBusca(params) {
  const { editora, titulo, minPaginas, maxPaginas, nomeAutor} = params;

    // const regex = new RegExp(titulo, "i")    
     let busca = {};

    if (editora) busca.editora = editora;
    if (titulo) busca.titulo = {$regex: titulo, $options: "i" };//regex

    if (minPaginas || maxPaginas) busca.numeroPaginas = {};
    

    // gte = Greater than or Equal = Maior ou igual que
    if (minPaginas) busca.numeroPaginas.$gte = minPaginas; 

    // lte = Less than or Equal = Menor ou igual que
    if (maxPaginas) busca.numeroPaginas.$lte = maxPaginas;
    
    if(nomeAutor){
      const autor = await autores.findOne({nome: nomeAutor });

      if(autor !== null) {
        busca.autor = autor._id;
        
      }else{
        busca = null;
      }

    }
    return busca;
};

export default LivroController;