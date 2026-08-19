FROM ruby:3.1

WORKDIR /site

RUN gem install bundler -v 2.4.22

COPY Gemfile ./

RUN bundle _2.4.22_ install

COPY . .

CMD ["bundle", "_2.4.22_", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--port", "4000"]
