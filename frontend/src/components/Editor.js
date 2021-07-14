import ListErrors from "./ListErrors";
import React from "react";
import agent from "../agent";
import { connect } from "react-redux";
import {
  ADD_TAG,
  EDITOR_PAGE_LOADED,
  REMOVE_TAG,
  ITEM_SUBMITTED,
  EDITOR_PAGE_UNLOADED,
  UPDATE_FIELD_EDITOR
} from "../constants/actionTypes";
import {isUrl} from '../helpers/regex'

const mapStateToProps = state => ({
  ...state.editor
});

const mapDispatchToProps = dispatch => ({
  onAddTag: () => dispatch({ type: ADD_TAG }),
  onLoad: payload => dispatch({ type: EDITOR_PAGE_LOADED, payload }),
  onRemoveTag: tag => dispatch({ type: REMOVE_TAG, tag }),
  onSubmit: payload => dispatch({ type: ITEM_SUBMITTED, payload }),
  onUnload: payload => dispatch({ type: EDITOR_PAGE_UNLOADED }),
  onUpdateField: (key, value) =>
    dispatch({ type: UPDATE_FIELD_EDITOR, key, value })
});

class Editor extends React.Component {
  constructor() {
    super();
    this.state = {errors:{title :false, description:false, image:false, tagList:false}}

    const updateFieldEvent = key => ev =>
    this.props.onUpdateField(key, ev.target.value);
    this.changeTitle = updateFieldEvent("title");
    this.changeDescription = updateFieldEvent("description");
    this.changeImage = updateFieldEvent("image");
    this.changeTagInput = updateFieldEvent("tagInput");
  


    this.watchForEnter = ev => {
      if (ev.keyCode === 13) {
        ev.preventDefault();
        this.props.onAddTag();
      }
    };

    this.removeTagHandler = tag => () => {
      this.props.onRemoveTag(tag);
    };

    this.validateParams = item => {
      const { title, description, image = "", tagList} = item;
      const errors = {};
      if(!title){
        errors.title = "field required"
      } 
      if(!description){
        errors.description = "field required"
      } 
      if(!tagList ){
        errors.tagList = "field required"
      } 
      if( !image){
        errors.image = "field required"
      } 
      if(!isUrl(image)){
        errors.image = "field requires an url format"
      }
      this.setState({errors})
      return errors;
    }

    this.submitForm = ev => {
      //Validate fields 
      ev.preventDefault();
     
      const item = {
        title: this.props.title,
        description: this.props.description,
        image: this.props.image,
        tagList: this.props.tagList
      };

      const errors = this.validateParams(item);
      console.log("errors", errors)

      if(Object.keys(errors).length > 0) return;

      const slug = { slug: this.props.itemSlug };
      const promise = this.props.itemSlug
        ? agent.Items.update(Object.assign(item, slug))
        : agent.Items.create(item);

      this.props.onSubmit(promise);
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.slug !== nextProps.match.params.slug) {
      if (nextProps.match.params.slug) {
        this.props.onUnload();
        return this.props.onLoad(agent.Items.get(this.props.match.params.slug));
      }
      this.props.onLoad(null);
    }
  }

  componentWillMount() {
    if (this.props.match.params.slug) {
      return this.props.onLoad(agent.Items.get(this.props.match.params.slug));
    }
    this.props.onLoad(null);
  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  render() {
    const { title, description, image, tagList} = this.state.errors;
    return (
      <div className="editor-page">
        <div className="container page">
          <div className="row">
            <div className="col-md-10 offset-md-1 col-xs-12">
              <ListErrors errors={this.props.errors}></ListErrors>

              <form>
                <fieldset>
                  <fieldset className="form-group">
                    <input
                      className="form-control form-control-lg"
                      type="text"
                      placeholder="Item Title"
                      value={this.props.title}
                      onChange={this.changeTitle}
                    />
       
                  </fieldset>
                  {title && <div className="error">{title}</div>}

                  <fieldset className="form-group">
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="What's this item about?"
                      value={this.props.description}
                      onChange={this.changeDescription}
                    ></textarea>
                
                  </fieldset>
                  {description && <div>{description}</div>}

                  <fieldset className="form-group">
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Image url"
                      value={this.props.image}
                      onChange={this.changeImage}
                    />
                     
                  </fieldset>
                  {image && <div className="error">{image}</div>}

                  <fieldset className="form-group">
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Enter tags"
                      value={this.props.tagInput}
                      onChange={this.changeTagInput}
                      onKeyUp={this.watchForEnter}
                    />
                

                    <div className="tag-list pt-2">
                      {(this.props.tagList || []).map(tag => {
                        return (
                          <span
                            className="badge badge-pill badge-secondary p-2 mx-1"
                            key={tag}
                          >
                            <i
                              className="ion-close-round"
                              onClick={this.removeTagHandler(tag)}
                            ></i>
                            {tag}
                          </span>
                        );
                      })}
                    </div>
       
                  </fieldset>
                  {tagList && <div className="error">{tagList}</div>}

                  <button
                    className="btn btn-lg pull-xs-right btn-primary"
                    type="button"
                    disabled={this.props.inProgress}
                    onClick={this.submitForm}
                  >
                    Publish Item
                  </button>
                </fieldset>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Editor);
